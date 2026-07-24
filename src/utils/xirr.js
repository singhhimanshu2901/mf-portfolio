// ======================================
// XIRR (approximate)
// ======================================
// IMPORTANT: this function currently uses the exact same point-to-point
// formula as calculateCAGR (invested -> currentValue over one date range).
// True XIRR is a money-weighted rate of return computed across ALL
// individual cash flows (every SIP installment / withdrawal, each with its
// own date), solved via Newton-Raphson so that the net present value of
// all cash flows equals zero. If your portfolio has multiple transactions
// over time, this simplified version will UNDER/OVER-state the real XIRR.
//
// If you have a transaction list available (array of { date, amount }),
// use `calculateXIRRFromCashflows` below instead for an accurate figure.

export const calculateXIRR = (invested, currentValue, startDate) => {
  if (!invested || !currentValue || !startDate) {
    return 0;
  }

  if (invested <= 0 || currentValue <= 0) {
    return 0;
  }

  const years = (new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24 * 365.25);

  if (!Number.isFinite(years) || years <= 0) {
    return 0;
  }

  const xirr = (Math.pow(currentValue / invested, 1 / years) - 1) * 100;

  return Number.isFinite(xirr) ? Number(xirr.toFixed(2)) : 0;
};

// ======================================
// Accurate XIRR from a real cash-flow schedule
// ======================================
// cashflows: [{ date: "2024-01-15", amount: -5000 }, ..., { date: today, amount: currentValue }]
// Convention: money going OUT of your pocket (investments/SIPs) is negative,
// money coming back / the final current value is positive.
export const calculateXIRRFromCashflows = (cashflows) => {
  if (!Array.isArray(cashflows) || cashflows.length < 2) {
    return 0;
  }

  const sorted = [...cashflows].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const t0 = new Date(sorted[0].date);
  const years = sorted.map(
    (cf) => (new Date(cf.date) - t0) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const npv = (rate) =>
    sorted.reduce(
      (sum, cf, i) => sum + cf.amount / Math.pow(1 + rate, years[i]),
      0
    );

  const npvDerivative = (rate) =>
    sorted.reduce((sum, cf, i) => {
      if (years[i] === 0) return sum;
      return sum - (years[i] * cf.amount) / Math.pow(1 + rate, years[i] + 1);
    }, 0);

  let rate = 0.1; // 10% initial guess
  const MAX_ITERATIONS = 100;
  const TOLERANCE = 1e-7;
  let converged = false;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const value = npv(rate);
    const derivative = npvDerivative(rate);

    if (Math.abs(derivative) < 1e-10) break;

    const nextRate = rate - value / derivative;

    if (Math.abs(nextRate - rate) < TOLERANCE) {
      rate = nextRate;
      converged = true;
      break;
    }

    // Guard against Newton-Raphson shooting off to a nonsensical rate
    // (e.g. -100% or +infinity), which happens for some real-world cash
    // flow patterns (a fund that lost most of its value very quickly).
    if (!Number.isFinite(nextRate) || nextRate <= -0.9999) {
      break;
    }

    rate = nextRate;
  }

  // Fallback: Newton-Raphson can fail to converge for portfolios that are
  // down sharply or have unusual cash-flow timing. If it didn't converge,
  // fall back to bisection on a wide, safe range — slower, but guaranteed
  // to find a root if the NPV function actually changes sign there. This
  // matters for accuracy: silently returning a wrong/unconverged number
  // (or always defaulting to 0) is worse than doing a bit more work here.
  if (!converged || !Number.isFinite(rate)) {
    let low = -0.9999;
    let high = 10; // +1000% annualized, generous upper bound
    const lowVal = npv(low);
    const highVal = npv(high);

    if (Number.isFinite(lowVal) && Number.isFinite(highVal) && lowVal * highVal < 0) {
      for (let i = 0; i < 200; i++) {
        const mid = (low + high) / 2;
        const midVal = npv(mid);

        if (Math.abs(midVal) < TOLERANCE) {
          rate = mid;
          break;
        }

        if (lowVal * midVal < 0) {
          high = mid;
        } else {
          low = mid;
        }

        rate = mid;
      }
    } else {
      return 0;
    }
  }

  if (!Number.isFinite(rate)) return 0;

  return Number((rate * 100).toFixed(2));
};

// ======================================
// Convenience wrapper: build cashflows from a transaction list
// ======================================
// transactions: [{ date, amount }] where `amount` is money you invested
// (always positive in this app's data model). `currentValue` is the
// fund/portfolio's value as of `asOfDate` (defaults to today).
export const calculateXIRRFromTransactions = (
  transactions,
  currentValue,
  asOfDate = new Date()
) => {
  if (!Array.isArray(transactions) || !transactions.length) {
    return 0;
  }

  const cashflows = transactions
    .filter((txn) => txn && txn.date && Number(txn.amount) > 0)
    .map((txn) => ({
      date: txn.date,
      amount: -Math.abs(Number(txn.amount))
    }));

  if (!cashflows.length) {
    return 0;
  }

  cashflows.push({
    date: asOfDate instanceof Date ? asOfDate.toISOString().split("T")[0] : asOfDate,
    amount: Number(currentValue) || 0
  });

  return calculateXIRRFromCashflows(cashflows);
};

// ======================================
// CAGR (Compound Annual Growth Rate)
// ======================================
// NOTE: this is a point-to-point CAGR based on a single invested amount and
// a single start date. It's a reasonable approximation for a lump-sum
// investment, but is NOT accurate for a portfolio built via periodic SIPs
// (multiple cash flows on different dates) — for that you need a proper
// money-weighted return (XIRR over the full cash-flow schedule). Treat the
// output here as an estimate, not an exact figure, when transactions were
// spread out over time.

export const calculateCAGR = (invested, currentValue, startDate) => {
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

  const cagr = (Math.pow(currentValue / invested, 1 / years) - 1) * 100;

  return Number.isFinite(cagr) ? Number(cagr.toFixed(2)) : 0;
};

// ======================================
// Weighted CAGR (for SIP / multi-transaction portfolios)
// ======================================
// Plain CAGR only makes sense for a single lump sum on a single date.
// A portfolio built via periodic SIPs has money invested at many
// different points in time, most of it more recently than the very first
// transaction — so using "years since the first SIP" as the compounding
// period overstates how long the money has actually been invested and
// therefore UNDERSTATES the true growth rate.
//
// This computes an amount-weighted average holding period across all
// transactions, then applies the standard compound growth formula over
// that weighted period. It's still an approximation (true accuracy for
// multiple cash flows is XIRR, see xirr.js), but it's meaningfully closer
// to reality than single-date CAGR for anyone investing via SIP.
export const calculateWeightedCAGR = (transactions, currentValue, asOfDate = new Date()) => {
  if (!Array.isArray(transactions) || !transactions.length || !currentValue) {
    return 0;
  }

  const today = asOfDate instanceof Date ? asOfDate : new Date(asOfDate);

  let totalInvested = 0;
  let weightedYears = 0;

  for (const txn of transactions) {
    const amount = Number(txn?.amount) || 0;
    if (amount <= 0 || !txn?.date) continue;

    const years = (today - new Date(txn.date)) / (1000 * 60 * 60 * 24 * 365.25);
    if (!Number.isFinite(years) || years <= 0) continue;

    totalInvested += amount;
    weightedYears += amount * years;
  }

  if (totalInvested <= 0) return 0;

  const avgYears = weightedYears / totalInvested;
  if (avgYears <= 0) return 0;

  const cagr = (Math.pow(currentValue / totalInvested, 1 / avgYears) - 1) * 100;

  return Number.isFinite(cagr) ? Number(cagr.toFixed(2)) : 0;
};

// ======================================
// FD Value Calculation
// ======================================
// ACCURACY FIX: Indian bank FDs almost universally compound quarterly, not
// annually. Using annual compounding understates the FD comparison value
// used throughout the app (MF vs FD cards), which in turn overstates how
// much better the mutual fund portfolio looks compared to a FD. Switching
// to quarterly compounding gives a fairer, more realistic comparison.

export const calculateFDValue = (amount, investmentDate, annualRate = 7) => {
  const startDate = new Date(investmentDate);
  const today = new Date();

  const years = (today - startDate) / (1000 * 60 * 60 * 24 * 365.25);

  // Guard against invalid/future dates (would otherwise produce NaN or a
  // nonsensical negative-time compounding result).
  if (!Number.isFinite(years) || years <= 0) {
    return Number(amount) || 0;
  }

  const quarterlyRate = annualRate / 100 / 4;
  const quarters = years * 4;

  const fdValue = Number(amount) * Math.pow(1 + quarterlyRate, quarters);

  return Number.isFinite(fdValue) ? fdValue : Number(amount) || 0;
};

export const calculatePortfolioFDValue = (transactions, annualRate = 7) => {
  if (!Array.isArray(transactions)) {
    return 0;
  }

  let totalFDValue = 0;

  for (const txn of transactions) {
    totalFDValue += calculateFDValue(Number(txn.amount), txn.date, annualRate);
  }

  return totalFDValue;
};

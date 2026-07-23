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

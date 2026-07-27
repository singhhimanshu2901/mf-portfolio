import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { getNav } from "./navService";
import { calculateXIRRFromTransactions } from "../utils/xirr";

// ======================================
// Helpers
// ======================================

const round = (value) => Number(Number(value || 0).toFixed(2));

const calculateInvestmentAge = (date) => {
  if (!date) {
    return "--";
  }

  const start = new Date(date);
  const today = new Date();

  const totalMonths =
    (today.getFullYear() - start.getFullYear()) * 12 +
    (today.getMonth() - start.getMonth());

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years <= 0) {
    return `${months} Months`;
  }

  return `${years} Years ${months} Months`;
};

const createHolding = (transaction) => ({
  fundName: transaction.fundName,
  schemeCode: transaction.schemeCode,
  category: transaction.category,
  invested: 0,
  units: 0,
  averageBuyNav: 0,
  currentNav: 0,
  navDate: null,
  currentValue: 0,
  profit: 0,
  returnPercent: 0,
  xirr: 0,
  firstInvestmentDate: transaction.date,
  lastInvestmentDate: transaction.date,
  investmentAge: "--",
  transactionCount: 0,
  // Kept so we can compute a real cash-flow-based XIRR per fund below,
  // instead of a single-date approximation.
  transactions: []
});

// ======================================
// Save Investment
// ======================================

export const saveInvestment = async (investmentData) => {
  await addDoc(collection(db, "transactions"), {
    ...investmentData,
    amount: Number(investmentData.amount),
    units: Number(investmentData.units),
    createdAt: serverTimestamp()
  });

  await updatePortfolioSummary(investmentData.uid);
};

// ======================================
// Get Investments
// ======================================

export const getInvestments = async (uid) => {
  const q = query(collection(db, "transactions"), where("uid", "==", uid));

  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    amount: round(doc.data().amount),
    units: round(doc.data().units)
  }));

  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  return transactions;
};

// ======================================
// Portfolio Holdings
// ======================================

export const getPortfolioHoldings = async (uid) => {
  const transactions = await getInvestments(uid);

  if (!transactions.length) {
    return [];
  }

  const holdingsMap = {};

  // ===============================
  // Merge Transactions
  // ===============================

  for (const txn of transactions) {
    const key = String(txn.schemeCode);

    if (!holdingsMap[key]) {
      holdingsMap[key] = createHolding(txn);
    }

    const holding = holdingsMap[key];
    holding.transactionCount++;
    holding.invested += Number(txn.amount);
    holding.units += Number(txn.units);
    holding.lastInvestmentDate = txn.date;

    holding.transactions.push({
      date: txn.date,
      amount: Number(txn.amount)
    });

    holding.averageBuyNav =
      holding.units > 0 ? round(holding.invested / holding.units) : 0;
  }

  const holdings = Object.values(holdingsMap);

  // ===============================
  // Fetch NAV Parallel
  // ===============================

  const navResponses = await Promise.all(
    holdings.map((holding) => getNav(holding.schemeCode))
  );

  // ===============================
  // Final Calculations
  // ===============================

  return holdings.map((holding, index) => {
    const navData = navResponses[index] || {};
    const currentNav = round(navData.nav);
    const currentValue = round(holding.units * currentNav);
    const profit = round(currentValue - holding.invested);

    const returnPercent =
      holding.invested > 0 ? round((profit / holding.invested) * 100) : 0;

    // ACCURACY FIX: previously this used calculateXIRR(invested,
    // currentValue, firstInvestmentDate) — a single-date approximation
    // that ignores every transaction after the first one. For a fund
    // bought via SIP (the common case), that meaningfully over/under
    // states the real return. calculateXIRRFromTransactions solves the
    // actual money-weighted rate of return across every individual
    // transaction's date and amount, which is what "XIRR" is supposed to
    // mean in the first place.
    const xirr = calculateXIRRFromTransactions(
      holding.transactions,
      currentValue
    );

    const investmentAge = calculateInvestmentAge(holding.firstInvestmentDate);

    return {
      ...holding,
      invested: round(holding.invested),
      units: round(holding.units),
      averageBuyNav: round(holding.averageBuyNav),
      currentNav,
      navDate: navData.date || null,
      currentValue,
      profit,
      returnPercent,
      xirr,
      investmentAge,
      wealthMultiplier:
        holding.invested > 0 ? round(currentValue / holding.invested) : 0
    };
  });
};

// ======================================
// Get Single Holding
// ======================================

export const getHoldingBySchemeCode = async (uid, schemeCode) => {
  const holdings = await getPortfolioHoldings(uid);

  return (
    holdings.find((item) => String(item.schemeCode) === String(schemeCode)) ||
    null
  );
};

// ======================================
// Get Fund Transactions
// ======================================

export const getFundTransactions = async (uid, schemeCode) => {
  const transactions = await getInvestments(uid);

  return transactions.filter(
    (txn) => String(txn.schemeCode) === String(schemeCode)
  );
};

// ======================================
// Compute Summary From Holdings (pure, no Firestore read/write)
// ======================================
// ROOT-CAUSE FIX for the "Executive Summary vs Holdings page total
// mismatch" bug:
//
// Previously, `getPortfolioSummary()` read a cached document from
// Firestore ("portfolio_summary") that is only rewritten by
// `updatePortfolioSummary()` — which only ever runs right after a NEW
// transaction is saved. Meanwhile `getPortfolioHoldings()` always fetches
// LIVE, current NAVs. So any time NAVs move between "the last time you
// added an investment" and "right now", the cached summary.currentValue
// and the freshly-computed holdings total silently drift apart — which is
// exactly what the report showed (13,805.92 vs 13,909.50).
//
// This function derives the summary directly from an already-fetched
// `holdings` array (same data, same instant, same NAVs), so callers like
// Reports.jsx can guarantee both numbers always match. It contains the
// exact same aggregation logic that used to live only inside
// `updatePortfolioSummary`, so behavior for the cached/Dashboard use case
// is unchanged.
export const computeSummaryFromHoldings = (holdings) => {
  if (!holdings || !holdings.length) {
    return {
      totalInvested: 0,
      currentValue: 0,
      profitLoss: 0,
      returnPercent: 0,
      equityValue: 0,
      debtValue: 0,
      liquidValue: 0,
      hybridValue: 0,
      equityPercent: 0,
      debtPercent: 0,
      liquidPercent: 0,
      hybridPercent: 0,
      fundCount: 0,
      updatedAt: Date.now()
    };
  }

  const totalInvested = round(
    holdings.reduce((sum, item) => sum + item.invested, 0)
  );

  const currentValue = round(
    holdings.reduce((sum, item) => sum + item.currentValue, 0)
  );

  const profitLoss = round(currentValue - totalInvested);

  const returnPercent =
    totalInvested > 0 ? round((profitLoss / totalInvested) * 100) : 0;

  const equityValue = round(
    holdings
      .filter((item) => item.category?.toLowerCase().includes("equity"))
      .reduce((sum, item) => sum + item.currentValue, 0)
  );

  const debtValue = round(
    holdings
      .filter((item) => item.category?.toLowerCase().includes("debt"))
      .reduce((sum, item) => sum + item.currentValue, 0)
  );

  const liquidValue = round(
    holdings
      .filter((item) => item.category?.toLowerCase().includes("liquid"))
      .reduce((sum, item) => sum + item.currentValue, 0)
  );

  // BUG FIX: funds found via the live mfapi.in search can be tagged
  // "Hybrid" (balanced/multi-asset schemes) by inferFundCategory(), but
  // this function used to only bucket equity/debt/liquid. A Hybrid
  // holding's value was still counted in `currentValue` but excluded from
  // every category bucket — so equityPercent + debtPercent + liquidPercent
  // wouldn't add up to 100%, and the allocation pie chart would silently
  // be missing a slice for it. Hybrid now gets its own bucket everywhere
  // (Dashboard pie, PDF report, etc.).
  const hybridValue = round(
    holdings
      .filter((item) => item.category?.toLowerCase().includes("hybrid"))
      .reduce((sum, item) => sum + item.currentValue, 0)
  );

  const equityPercent =
    currentValue > 0 ? round((equityValue / currentValue) * 100) : 0;

  const debtPercent =
    currentValue > 0 ? round((debtValue / currentValue) * 100) : 0;

  const liquidPercent =
    currentValue > 0 ? round((liquidValue / currentValue) * 100) : 0;

  const hybridPercent =
    currentValue > 0 ? round((hybridValue / currentValue) * 100) : 0;

  return {
    totalInvested,
    currentValue,
    profitLoss,
    returnPercent,
    equityValue,
    debtValue,
    liquidValue,
    hybridValue,
    equityPercent,
    debtPercent,
    liquidPercent,
    hybridPercent,
    fundCount: holdings.length,
    updatedAt: Date.now()
  };
};

// ======================================
// Update Portfolio Summary (Firestore cache write)
// ======================================
// Now just fetches holdings and delegates the math to
// computeSummaryFromHoldings, so there's only ONE place the aggregation
// logic lives.

export const updatePortfolioSummary = async (uid) => {
  const holdings = await getPortfolioHoldings(uid);
  const summary = computeSummaryFromHoldings(holdings);

  await setDoc(doc(db, "portfolio_summary", uid), summary);
};

// ======================================
// Get Portfolio Summary (cached — OK for Dashboard-style "at a glance"
// views where a few minutes/hours of staleness doesn't matter. Do NOT use
// this for the Reports page; use computeSummaryFromHoldings(holdings)
// there instead so the report is internally consistent.)
// ======================================

export const getPortfolioSummary = async (uid) => {
  const snapshot = await getDoc(doc(db, "portfolio_summary", uid));

  if (snapshot.exists()) {
    return snapshot.data();
  }

  return {
    totalInvested: 0,
    currentValue: 0,
    profitLoss: 0,
    returnPercent: 0,
    equityValue: 0,
    debtValue: 0,
    liquidValue: 0,
    equityPercent: 0,
    debtPercent: 0,
    liquidPercent: 0,
    fundCount: 0,
    updatedAt: 0
  };
};

// ======================================
// Portfolio Stats
// ======================================

export const getPortfolioStats = async (uid) => {
  const holdings = await getPortfolioHoldings(uid);

  if (!holdings.length) {
    return {
      bestFund: null,
      worstFund: null,
      totalFunds: 0
    };
  }

  const sorted = [...holdings].sort((a, b) => b.returnPercent - a.returnPercent);

  return {
    bestFund: sorted[0],
    worstFund: sorted[sorted.length - 1],
    totalFunds: holdings.length
  };
};

// ======================================
// Refresh Portfolio
// ======================================

export const refreshPortfolio = async (uid) => {
  await updatePortfolioSummary(uid);
  return await getPortfolioSummary(uid);
};

// ======================================
// Export
// ======================================

export default {
  saveInvestment,
  getInvestments,
  getPortfolioHoldings,
  getHoldingBySchemeCode,
  getFundTransactions,
  computeSummaryFromHoldings,
  updatePortfolioSummary,
  getPortfolioSummary,
  getPortfolioStats,
  refreshPortfolio
};

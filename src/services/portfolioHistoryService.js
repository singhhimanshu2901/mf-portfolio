import { getInvestments } from "./portfolioService";
import { getNavHistory } from "./navHistoryService";

export const getPortfolioHistory = async (uid, timeframe = "ALL") => {
  const transactions = await getInvestments(uid);

  if (!transactions.length) return [];

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // -----------------------------
  // Unique Schemes
  // -----------------------------

  const schemes = [...new Set(sortedTransactions.map((txn) => txn.schemeCode))];

  // -----------------------------
  // Load NAV History
  // -----------------------------

  const navHistoryMap = {};

  await Promise.all(
    schemes.map(async (schemeCode) => {
      const history = await getNavHistory(schemeCode);
      navHistoryMap[schemeCode] = history;
    })
  );

  // -----------------------------
  // Build NAV Index
  // -----------------------------

  const navIndex = {};
  const allNavDates = new Set();

  schemes.forEach((schemeCode) => {
    navIndex[schemeCode] = {};

    navHistoryMap[schemeCode].forEach((item) => {
      navIndex[schemeCode][item.date] = Number(item.nav);
      allNavDates.add(item.date);
    });
  });

  // -----------------------------
  // Timeline
  // ------------------------------
  // PERFORMANCE FIX: this used to iterate every single calendar day
  // between the first transaction and today (~365 iterations/year,
  // regardless of whether the NAV actually changed). Weekends/holidays
  // have no published NAV, so those days always just repeated the
  // previous value and were then thrown away entirely by the "Remove
  // Duplicate Values" step further down — wasted work for portfolios held
  // several years.
  //
  // The timeline now only needs to include days where SOMETHING could
  // have changed: an actual NAV publish date (trading day) for any held
  // scheme, or a transaction date (a new investment can update
  // units/invested even without a NAV to display it against). This
  // produces the exact same final data, with meaningfully less
  // computation for long-held, multi-fund portfolios.

  const firstDate = sortedTransactions[0].date;
  const todayStr = new Date().toISOString().split("T")[0];

  const timelineSet = new Set();

  allNavDates.forEach((date) => {
    if (date >= firstDate && date <= todayStr) {
      timelineSet.add(date);
    }
  });

  sortedTransactions.forEach((txn) => {
    if (txn.date <= todayStr) {
      timelineSet.add(txn.date);
    }
  });

  // Always include today so the "current" point is present even if today
  // isn't a trading day.
  timelineSet.add(todayStr);

  const timeline = [...timelineSet].sort();

  // -----------------------------
  // Holdings State
  // -----------------------------

  const holdings = {};

  schemes.forEach((schemeCode) => {
    holdings[schemeCode] = {
      units: 0,
      invested: 0
    };
  });

  const history = [];

  // -----------------------------
  // Transaction Pointer
  // -----------------------------

  let txnIndex = 0;
  let lastNav = {};

  schemes.forEach((schemeCode) => {
    lastNav[schemeCode] = 0;
  });

  // -----------------------------
  // Build History (only on dates that can actually change something)
  // -----------------------------

  for (const date of timeline) {
    // Add all transactions that happened up to and including this date.
    while (
      txnIndex < sortedTransactions.length &&
      sortedTransactions[txnIndex].date <= date
    ) {
      const txn = sortedTransactions[txnIndex];

      holdings[txn.schemeCode].units += Number(txn.units);
      holdings[txn.schemeCode].invested += Number(txn.amount);

      txnIndex++;
    }

    let invested = 0;
    let portfolio = 0;

    for (const schemeCode of schemes) {
      const navToday = navIndex[schemeCode][date];

      if (navToday != null) {
        lastNav[schemeCode] = navToday;
      }

      if (lastNav[schemeCode] === 0) {
        continue;
      }

      invested += holdings[schemeCode].invested;
      portfolio += holdings[schemeCode].units * lastNav[schemeCode];
    }

    if (invested === 0) {
      continue;
    }

    history.push({
      date,
      invested,
      portfolio: Number(portfolio.toFixed(2)),
      profit: Number((portfolio - invested).toFixed(2)),
      returnPercent: Number((((portfolio - invested) / invested) * 100).toFixed(2))
    });
  }

  // -----------------------------
  // Timeframe Filter
  // -----------------------------

  const daysMap = {
    "1D": 1,
    "1W": 7,
    "1M": 30,
    "6M": 180,
    "1Y": 365,
    ALL: Infinity
  };

  const limit = daysMap[timeframe] ?? Infinity;

  let finalHistory = history;

  if (limit !== Infinity) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - limit);

    finalHistory = history.filter((item) => new Date(item.date) >= cutoff);
  }

  // -----------------------------
  // Remove Duplicate Values
  // -----------------------------

  finalHistory = finalHistory.filter((item, index) => {
    if (index === 0) return true;

    return (
      item.portfolio !== finalHistory[index - 1].portfolio ||
      item.invested !== finalHistory[index - 1].invested
    );
  });

  // -----------------------------
  // Last Value Sync
  // -----------------------------

  if (finalHistory.length > 1) {
    const last = finalHistory[finalHistory.length - 1];

    last.portfolio = Number(last.portfolio.toFixed(2));
    last.profit = Number((last.portfolio - last.invested).toFixed(2));
    last.returnPercent = Number(((last.profit / last.invested) * 100).toFixed(2));
  }

  return finalHistory;
};

import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/nav-history";

const cache = {};

export const getNavHistory = async (schemeCode) => {
  if (cache[schemeCode]) {
    return cache[schemeCode];
  }

  const response = await axios.get(`${API}/${schemeCode}`);

  cache[schemeCode] = response.data;

  return response.data;
};

// ======================================
// Get NAV as of a specific date
// ======================================
// ROOT-CAUSE FIX for "purchase NAV is wrong": AddInvestment.jsx previously
// always used getNav() (today's live NAV) no matter what date the user
// selected, so backfilling an old investment silently recorded today's
// price as the purchase price. This looks up the fund's actual NAV
// history and finds the NAV for the exact date — or, if that date wasn't
// a trading day (weekend/market holiday, when AMFI doesn't publish a
// NAV), the closest earlier trading day, which is the standard
// convention (a unit bought on a non-trading day is allotted at the NAV
// of the next applicable business day in reality, but for historical
// backfilling the nearest prior published NAV is the best available
// estimate).
export const getNavOnDate = async (schemeCode, date) => {
  const history = await getNavHistory(schemeCode);

  if (!Array.isArray(history) || !history.length) {
    return null;
  }

  const targetTime = new Date(date).getTime();

  // history entries look like { date: "YYYY-MM-DD", nav: "123.4500" }
  // sorted here defensively in case the API ever changes order.
  const sorted = [...history].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  let bestMatch = null;

  for (const entry of sorted) {
    const entryTime = new Date(entry.date).getTime();

    if (entryTime <= targetTime) {
      bestMatch = entry;
    } else {
      break;
    }
  }

  // If the requested date is before the fund's earliest available NAV
  // record (e.g. a typo, or a date before the scheme existed), fall back
  // to the earliest known NAV rather than returning nothing.
  if (!bestMatch) {
    bestMatch = sorted[0];
  }

  return {
    date: bestMatch.date,
    nav: Number(bestMatch.nav)
  };
};

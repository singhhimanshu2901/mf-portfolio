import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/nav";

const navCache = new Map();
const pendingRequests = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// Cleanup
setInterval(() => {
  const now = Date.now();

  for (const [key, value] of navCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      navCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const loadFunds = async () => {
  const response = await fetch("/funds.json");
  return await response.json();
};

export const getNav = async (schemeCode) => {
  const now = Date.now();

  const cached = navCache.get(schemeCode);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (pendingRequests.has(schemeCode)) {
    return await pendingRequests.get(schemeCode);
  }

  const fetchPromise = axios
    .get(`${API}/${schemeCode}`)
    .then((response) => {
      navCache.set(schemeCode, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    })
    .finally(() => {
      pendingRequests.delete(schemeCode);
    });

  pendingRequests.set(schemeCode, fetchPromise);

  return await fetchPromise;
};

// ======================================
// Live Fund Search (mfapi.in)
// ======================================
// PREVIOUS BEHAVIOR: fund search only matched against a small, manually
// maintained /funds.json file, so most major/real schemes simply weren't
// searchable.
//
// FIX: search against https://api.mfapi.in/mf/search — a free, public,
// no-auth-required API that covers the FULL AMFI universe (~37,000+ real
// Indian mutual fund schemes, updated daily). This is deliberately NOT a
// hand-typed static list: any scheme code I might type from memory could
// be wrong and would silently break NAV fetching for that fund later,
// which is worse than a smaller-but-correct list. Searching the live,
// authoritative source instead means every result is guaranteed to be a
// real, currently valid scheme + scheme code.
//
// mfapi.in's search results only return { schemeCode, schemeName } — no
// category. We infer a rough category from the scheme name so the rest
// of the app (equity/debt/liquid allocation math) keeps working. This is
// a heuristic, not authoritative — if you need precise category data,
// consider cross-referencing AMFI's category list by ISIN/scheme code.
const MFAPI_SEARCH_URL = "https://api.mfapi.in/mf/search";

export const inferFundCategory = (schemeName = "") => {
  const name = schemeName.toLowerCase();

  if (
    name.includes("liquid") ||
    name.includes("overnight") ||
    name.includes("money market")
  ) {
    return "Liquid";
  }

  if (
    name.includes("gilt") ||
    name.includes("debt") ||
    name.includes("bond") ||
    name.includes("income fund") ||
    name.includes("credit risk") ||
    name.includes("banking and psu") ||
    name.includes("corporate bond") ||
    name.includes("short duration") ||
    name.includes("medium duration") ||
    name.includes("dynamic bond") ||
    name.includes("fixed maturity")
  ) {
    return "Debt";
  }

  if (
    name.includes("hybrid") ||
    name.includes("balanced") ||
    name.includes("multi asset") ||
    name.includes("asset allocation") ||
    name.includes("equity savings")
  ) {
    return "Hybrid";
  }

  // Default: most retail growth-oriented searches (Flexi Cap, Large Cap,
  // Mid Cap, Small Cap, ELSS, Index, Bluechip, Sectoral, Focused, Value,
  // Contra, Multi Cap, Thematic, etc.) are equity schemes.
  return "Equity";
};

export const searchFunds = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await axios.get(MFAPI_SEARCH_URL, {
      params: { q: query.trim() }
    });

    const results = Array.isArray(response.data) ? response.data : [];

    return results.map((item) => ({
      schemeCode: String(item.schemeCode),
      schemeName: item.schemeName,
      category: inferFundCategory(item.schemeName)
    }));
  } catch (error) {
    // Network hiccup, mfapi.in temporarily down, CORS in an unusual
    // deployment environment, etc. Fail soft — the caller (AddInvestment)
    // falls back to the local funds.json list in this case rather than
    // showing a broken search box.
    console.error("Live fund search failed:", error);
    return null;
  }
};

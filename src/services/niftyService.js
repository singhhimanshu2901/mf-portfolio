import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/nifty";

// ======================================
// ROOT-CAUSE FIX (same pattern as the NAV history bug): if the backend's
// Nifty route fails (Yahoo Finance's unofficial API can reject, rate-limit,
// or change shape without notice) it returns a non-array error response.
// Dashboard.jsx used to call nifty.map(...) directly on whatever came back
// — if it wasn't an array, that threw "nifty.map is not a function" and
// crashed the ENTIRE dashboard load. We now always return an array here
// (empty on failure) so a Nifty outage degrades gracefully instead of
// breaking the whole page.
// ======================================

export const getNiftyData = async (period = "1mo") => {
  try {
    const response = await axios.get(API, {
      params: { period }
    });

    if (Array.isArray(response.data)) {
      return response.data;
    }

    console.warn(
      "Nifty data response was not an array (backend/Yahoo Finance issue). Returning empty data.",
      response.data
    );
    return [];
  } catch (error) {
    console.warn("Failed to fetch Nifty data. Returning empty data.", error);
    return [];
  }
};
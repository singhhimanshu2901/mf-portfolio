import axios from "axios";

const API =
  import.meta.env.VITE_API_URL +
  "/api/nav-history";

const cache = {};

export const getNavHistory = async (
  schemeCode
) => {

  if (cache[schemeCode]) {
    return cache[schemeCode];
  }

  const response =
    await axios.get(
      `${API}/${schemeCode}`
    );

  cache[schemeCode] =
    response.data;

  return response.data;

};
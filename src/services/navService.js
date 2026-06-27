import axios from "axios";

const API =
  import.meta.env.VITE_API_URL +
  "/api/nav";

const navCache = new Map();

const pendingRequests = new Map();

const CACHE_DURATION =
  5 * 60 * 1000;

// Cleanup
setInterval(() => {

  const now =
    Date.now();

  for (const [

    key,

    value

  ] of navCache.entries()) {

    if (

      now -

      value.timestamp >

      CACHE_DURATION

    ) {

      navCache.delete(key);

    }

  }

}, 5 * 60 * 1000);
export const loadFunds = async () => {

  const response =
    await fetch(
      "/funds.json"
    );

  return await response.json();

};
export const getNav = async (
  schemeCode
) => {

  const now =
    Date.now();

  const cached =
    navCache.get(
      schemeCode
    );

  if (

    cached &&

    now -
      cached.timestamp <
      CACHE_DURATION

  ) {

    return cached.data;

  }

  if (

    pendingRequests.has(
      schemeCode
    )

  ) {

    return await pendingRequests.get(
      schemeCode
    );

  }

  const fetchPromise =
    axios

      .get(
        `${API}/${schemeCode}`
      )

      .then(response => {

        navCache.set(
          schemeCode,
          {

            data:
              response.data,

            timestamp:
              Date.now()

          }
        );

        return response.data;

      })

      .finally(() => {

        pendingRequests.delete(
          schemeCode
        );

      });

  pendingRequests.set(
    schemeCode,
    fetchPromise
  );

  return await fetchPromise;

};
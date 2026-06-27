import express from "express";

const router = express.Router();

// ===============================
// Cache
// ===============================

const CACHE_DURATION =
  24 * 60 * 60 * 1000;

const navCache =
  new Map();

const pendingRequests =
  new Map();

// ===============================
// Cleanup
// ===============================

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

}, 60 * 60 * 1000);

// ===============================
// NAV History
// ===============================

router.get(
  "/:schemeCode",
  async (req, res) => {

    try {

      const {

        schemeCode

      } = req.params;

      const now =
        Date.now();

      // =====================
      // Cache
      // =====================

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

        return res.json(
          cached.data
        );

      }

      // =====================
      // Duplicate Requests
      // =====================

      if (

        pendingRequests.has(
          schemeCode
        )

      ) {

        const data =

          await pendingRequests.get(
            schemeCode
          );

        return res.json(
          data
        );

      }

      // =====================
      // Fetch
      // =====================

      const fetchPromise =
        (async () => {

          const response =
            await fetch(

              `https://api.mfapi.in/mf/${schemeCode}`

            );

          if (

            !response.ok

          ) {

            throw new Error(

              `HTTP ${response.status}`

            );

          }

          const json =
            await response.json();

          if (

            !json ||

            !Array.isArray(
              json.data
            )

          ) {

            throw new Error(
              "Invalid NAV response"
            );

          }

          const history =

            json.data

              .map(item => ({

                date:

                  item.date

                    .split("-")

                    .reverse()

                    .join("-"),

                nav:

                  Number(
                    item.nav
                  )

              }))

              .reverse();

          navCache.set(

            schemeCode,

            {

              data:
                history,

              timestamp:
                Date.now()

            }

          );

          return history;

        })()

        .finally(() => {

          pendingRequests.delete(
            schemeCode
          );

        });

      pendingRequests.set(

        schemeCode,

        fetchPromise

      );

      const history =
        await fetchPromise;

      return res.json(
        history
      );

    }

    catch (err) {

      console.error(

        "NAV History Error:",

        err.message

      );

      return res.status(500).json({

        error:
          "Unable to fetch NAV history"

      });

    }

  }

);

export default router;
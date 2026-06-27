import express from "express";
import axios from "axios";

const router = express.Router();

const CACHE_DURATION =
  5 * 60 * 1000;

const navCache =
  new Map();

const pendingRequests =
  new Map();

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

router.get(
  "/:schemeCode",
  async (req, res) => {

    try {

      const { schemeCode } =
        req.params;

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

        return res.json(
          cached.data
        );

      }

      if (

        pendingRequests.has(
          schemeCode
        )

      ) {

        const data =
          await pendingRequests.get(
            schemeCode
          );

        return res.json(data);

      }

      const fetchPromise =
        axios

          .get(

            `https://api.mfapi.in/mf/${schemeCode}`,

            {

              timeout: 10000

            }

          )

          .then(response => {

            const latest =
              response.data.data[0];

            const data = {

              nav:
                Number(
                  latest.nav
                ),

              date:
                latest.date

            };

            navCache.set(

              schemeCode,

              {

                data,

                timestamp:
                  Date.now()

              }

            );

            return data;

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

      const data =
        await fetchPromise;

      res.json(data);

    }

    catch (err) {

      console.error(err);

      res.status(500).json({

        error:
          "Unable to fetch NAV"

      });

    }

  }
);

export default router;
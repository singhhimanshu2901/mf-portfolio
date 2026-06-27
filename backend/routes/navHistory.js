// backend/routes/navHistory.js

import express from "express";
import axios from "axios";

const router = express.Router();

// ===============================
// Memory Cache
// ===============================

const CACHE_DURATION =
  24 * 60 * 60 * 1000; // 24 Hours

const navCache =
  new Map();

const pendingRequests =
  new Map();

// ===============================
// Route
// ===============================

router.get(
  "/:schemeCode",
  async (req, res) => {

    try {

      const { schemeCode } =
        req.params;

      const now =
        Date.now();

      // ===========================
      // Cache Hit
      // ===========================

      const cached =
        navCache.get(
          schemeCode
        );

      if (
        cached &&
        now - cached.timestamp <
          CACHE_DURATION
      ) {

        return res.json(
          cached.data
        );

      }

      // ===========================
      // Prevent Duplicate Requests
      // ===========================

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

      // ===========================
      // Fetch Function
      // ===========================

      const fetchPromise =
        axios

          .get(
            `https://api.mfapi.in/mf/${schemeCode}`,
            {
              timeout: 10000
            }
          )

          .then(response => {

            const history =
              response.data.data

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

      const history =
        await fetchPromise;

      res.json(
        history
      );

    }

    catch (error) {

      console.error(
        "NAV API Error:",
        error.message
      );

      res.status(500).json({

        error:
          "Unable to fetch NAV history"

      });

    }

  }
);

export default router;
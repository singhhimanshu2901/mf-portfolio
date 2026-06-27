import express from "express";
import axios from "axios";

const router = express.Router();

// ==================================
// Memory Cache
// ==================================

const CACHE_DURATION =
  5 * 60 * 1000; // 5 Minutes

const niftyCache =
  new Map();

const pendingRequests =
  new Map();

// ===============================
// Cache Cleanup
// ===============================

setInterval(() => {

  const now =
    Date.now();

  for (const [

    key,

    value

  ] of niftyCache.entries()) {

    if (

      now -

      value.timestamp >

      CACHE_DURATION

    ) {

      niftyCache.delete(key);

    }

  }

}, 5 * 60 * 1000);

router.get("/", async (req, res) => {

  try {

    const period =
      req.query.period || "1mo";

    const now =
      Date.now();

    // =============================
    // Cache Hit
    // =============================

    const cached =
      niftyCache.get(period);

    if (
      cached &&
      now - cached.timestamp <
        CACHE_DURATION
    ) {

      return res.json(
        cached.data
      );

    }

    // =============================
    // Duplicate Requests
    // =============================

    if (
      pendingRequests.has(period)
    ) {

      const data =
        await pendingRequests.get(
          period
        );

      return res.json(data);

    }

    // =============================
    // Config
    // =============================

    const config = {

      "1d": {
        range: "5d",
        interval: "1d"
      },

      "1wk": {
        range: "1mo",
        interval: "1d"
      },

      "1mo": {
        range: "1mo",
        interval: "1d"
      },

      "6mo": {
        range: "6mo",
        interval: "1d"
      },

      "1y": {
        range: "1y",
        interval: "1d"
      },

      "max": {
        range: "max",
        interval: "1wk"
      }

    };

    const selected =
      config[period] ||
      config["1mo"];

    // =============================
    // Fetch Function
    // =============================

    const fetchPromise =
      axios

        .get(
          `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=${selected.range}&interval=${selected.interval}`,
          {
            timeout: 10000
          }
        )

        .then(response => {

          const result =
            response.data.chart.result[0];

          const timestamps =
            result.timestamp;

          const closes =
            result.indicators.quote[0].close;

          let lastClose = 0;

          const data =
            timestamps

              .map(
                (time, index) => {

                  if (
                    closes[index] != null
                  ) {

                    lastClose =
                      closes[index];

                  }

                  return {

                    date:
                      new Date(
                        time * 1000
                      )
                        .toISOString()
                        .split("T")[0],

                    close:
                      Number(
                        lastClose.toFixed(
                          2
                        )
                      )

                  };

                }
              )

              .filter(
                item =>
                  item.close > 0
              );

          niftyCache.set(
            period,
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
            period
          );

        });

    pendingRequests.set(
      period,
      fetchPromise
    );

    const data =
      await fetchPromise;

    res.json(data);

  }

  catch (err) {

    console.error(
      "NIFTY API Error:",
      err.message
    );

    res.status(500).json({

      error:
        "Failed to fetch NIFTY data"

    });

  }

});

export default router;
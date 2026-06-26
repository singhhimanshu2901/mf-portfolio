import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {

  try {

    const period =
      req.query.period || "1mo";

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

    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=${selected.range}&interval=${selected.interval}`;

    console.log(url);

    const response =
      await axios.get(url);

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
                  lastClose.toFixed(2)
                )

            };

          }
        )
        .filter(
          item =>
            item.close > 0
        );

    res.json(data);

  }

  catch (err) {

    console.error(
      err.response?.data ||
      err.message
    );

    res.status(500).json({

      error:
        "Failed to fetch NIFTY data"

    });

  }

});

export default router;
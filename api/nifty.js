import yahooFinance from "yahoo-finance2";

export default async function handler(req, res) {
  try {
    const range = req.query.range || "1mo";

    const intervalMap = {
      "1d": "5m",
      "1wk": "1d",
      "1mo": "1d",
      "6mo": "1d",
      "1y": "1d",
      "max": "1wk"
    };

    const result = await yahooFinance.chart("^NSEI", {
      period1: range,
      interval: intervalMap[range] || "1d"
    });

    const quotes =
      result.quotes?.map((item) => ({
        date: item.date,
        close: item.close
      })) || [];

    res.status(200).json(quotes);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
}
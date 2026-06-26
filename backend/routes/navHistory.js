// backend/routes/navHistory.js

import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/:schemeCode", async (req, res) => {

  try {

    const { schemeCode } = req.params;

    const response =
      await axios.get(
        `https://api.mfapi.in/mf/${schemeCode}`
      );

    const history =
      response.data.data
        .map((item) => ({

          date:
            item.date
              .split("-")
              .reverse()
              .join("-"),

          nav:
            Number(item.nav)

        }))
        .reverse();

    res.json(history);

  } catch (error) {

    console.error(error);

    res
      .status(500)
      .json({
        error:
          "Unable to fetch NAV history"
      });

  }

});

export default router;
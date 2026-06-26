import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import niftyRoutes from "./routes/nifty.js";
import navHistoryRoutes from "./routes/navHistory.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api/nifty",
  niftyRoutes
);

app.use(
  "/api/nav-history",
  navHistoryRoutes
);

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});
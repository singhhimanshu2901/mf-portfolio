import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import navRoutes from "./routes/nav.js";
import navHistoryRoutes from "./routes/navHistory.js";
import niftyRoutes from "./routes/nifty.js";

dotenv.config();

const app = express();

// ======================================
// Security
// ======================================

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// ======================================
// Compression
// ======================================

app.use(compression());

// ======================================
// Logging
// ======================================

app.use(morgan("combined"));

// ======================================
// CORS
// ======================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mf-portfolio-2901.vercel.app"
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    credentials: true
  })
);

// ======================================
// Body Parser
// ======================================

app.use(express.json());

// ======================================
// Rate Limiter
// ======================================

const limiter = rateLimit({

  windowMs:
    15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {

    error:
      "Too many requests. Please try again later."

  }

});

app.use(limiter);

// ======================================
// Health Check
// ======================================

app.get("/", (req, res) => {

  res.json({

    success: true,

    message:
      "MF Portfolio Backend Running 🚀",

    version: "1.0.0"

  });

});

// ======================================
// API Routes
// ======================================

app.use(
  "/api/nav",
  navRoutes
);

app.use(
  "/api/nav-history",
  navHistoryRoutes
);

app.use(
  "/api/nifty",
  niftyRoutes
);

// ======================================
// 404
// ======================================

app.use((req, res) => {

  res.status(404).json({

    error:
      "Route not found"

  });

});

// ======================================
// Global Error Handler
// ======================================

app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({

    error:
      "Internal Server Error"

  });

});

// ======================================
// Start Server
// ======================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});
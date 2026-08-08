import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

// NOTE: ThemeProvider (light/dark toggle) removed — the app is now
// always dark navy + gold to match the Landing page, so there's nothing
// to toggle. See src/context/ThemeContext.jsx (no longer used, kept in
// case you want to reintroduce a toggle later — safe to delete).

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

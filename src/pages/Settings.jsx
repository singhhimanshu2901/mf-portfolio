import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import {
  getCurrentUser,
  waitForAuth,
  updateDisplayName
} from "../services/authService";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  // ==============================
  // FD Rate (unchanged behavior)
  // ==============================

  const [fdRate, setFdRate] = useState(localStorage.getItem("fdRate") || 7);

  const saveSettings = () => {
    const rate = Number(fdRate);

    if (rate < 1 || rate > 15) {
      alert("Please enter FD rate between 1% and 15%");
      return;
    }

    localStorage.setItem("fdRate", rate);
    alert("Settings Saved Successfully");
  };

  // ==============================
  // Display Name
  // ==============================

  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    (async () => {
      let user = getCurrentUser();
      if (!user) user = await waitForAuth();
      if (user) setDisplayName(user.displayName || "");
    })();
  }, []);

  const saveDisplayName = async () => {
    if (!displayName.trim()) {
      alert("Please enter a display name");
      return;
    }

    try {
      setSavingName(true);
      await updateDisplayName(displayName.trim());
      alert("Display Name Updated Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update display name");
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        {/* ============================== */}
        {/* Appearance */}
        {/* ============================== */}

        <div
          className="p-6 rounded-xl max-w-xl mb-6"
          style={{ background: "var(--bg-surface)" }}
        >
          <h2 className="text-2xl font-bold mb-6">Appearance</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p style={{ color: "var(--text-secondary)" }} className="mt-1">
                Currently using {theme === "dark" ? "Dark" : "Light"} mode
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="relative w-16 h-9 rounded-full transition-colors"
              style={{
                background: theme === "dark" ? "#2563eb" : "var(--bg-surface-3)"
              }}
              aria-label="Toggle light/dark mode"
            >
              <span
                className="absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-transform flex items-center justify-center text-sm"
                style={{
                  transform: theme === "dark" ? "translateX(30px)" : "translateX(2px)"
                }}
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </span>
            </button>
          </div>
        </div>

        {/* ============================== */}
        {/* Display Name */}
        {/* ============================== */}

        <div
          className="p-6 rounded-xl max-w-xl mb-6"
          style={{ background: "var(--bg-surface)" }}
        >
          <h2 className="text-2xl font-bold mb-6">Profile</h2>

          <div className="mb-6">
            <label className="block mb-2">Display Name</label>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full p-3 rounded-lg border focus:outline-none focus:border-blue-500"
              style={{
                background: "var(--bg-surface-2)",
                borderColor: "var(--border-color-strong)"
              }}
            />
            <p style={{ color: "var(--text-secondary)" }} className="mt-2">
              This is shown as your welcome message on the Dashboard.
            </p>
          </div>

          <button
            onClick={saveDisplayName}
            disabled={savingName}
            className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {savingName ? "Saving..." : "Save Display Name"}
          </button>
        </div>

        {/* ============================== */}
        {/* FD Comparison */}
        {/* ============================== */}

        <div
          className="p-6 rounded-xl max-w-xl"
          style={{ background: "var(--bg-surface)" }}
        >
          <h2 className="text-2xl font-bold mb-6">FD Comparison Settings</h2>

          <div className="mb-6">
            <label className="block mb-2">FD Interest Rate (%)</label>

            <input
              type="number"
              value={fdRate}
              onChange={(e) => setFdRate(e.target.value)}
              className="w-full p-3 rounded-lg border focus:outline-none focus:border-blue-500"
              style={{
                background: "var(--bg-surface-2)",
                borderColor: "var(--border-color-strong)"
              }}
            />
            <p style={{ color: "var(--text-secondary)" }} className="mt-2">
              Current FD Comparison Rate:
              <span className="text-blue-400 font-semibold ml-2">
                {fdRate}%
              </span>
            </p>
          </div>

          <button
            onClick={saveSettings}
            className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

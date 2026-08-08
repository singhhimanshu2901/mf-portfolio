import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import {
  getCurrentUser,
  waitForAuth,
  updateDisplayName
} from "../services/authService";

export default function Settings() {
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
        <h1 className="font-display text-4xl mb-8">Settings</h1>

        {/* ============================== */}
        {/* Display Name */}
        {/* ============================== */}

        <div
          className="p-6 rounded-xl max-w-xl mb-6 border"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
        >
          <h2 className="font-display text-2xl mb-6">Profile</h2>

          <div className="mb-6">
            <label className="block mb-2">Display Name</label>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full p-3 rounded-lg border focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-color-strong)")}
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
            className="px-6 py-3 rounded font-medium transition-colors disabled:opacity-60"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            {savingName ? "Saving..." : "Save Display Name"}
          </button>
        </div>

        {/* ============================== */}
        {/* FD Comparison */}
        {/* ============================== */}

        <div
          className="p-6 rounded-xl max-w-xl border"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
        >
          <h2 className="font-display text-2xl mb-6">FD Comparison Settings</h2>

          <div className="mb-6">
            <label className="block mb-2">FD Interest Rate (%)</label>

            <input
              type="number"
              value={fdRate}
              onChange={(e) => setFdRate(e.target.value)}
              className="w-full p-3 rounded-lg border focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-color-strong)")}
              style={{
                background: "var(--bg-surface-2)",
                borderColor: "var(--border-color-strong)"
              }}
            />
            <p style={{ color: "var(--text-secondary)" }} className="mt-2">
              Current FD Comparison Rate:
              <span className="font-mono font-semibold ml-2" style={{ color: "var(--accent)" }}>
                {fdRate}%
              </span>
            </p>
          </div>

          <button
            onClick={saveSettings}
            className="px-6 py-3 rounded font-medium transition-colors"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

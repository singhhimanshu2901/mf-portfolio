import { useState } from "react";

import Sidebar from "../components/Sidebar";

export default function Settings() {

  const [fdRate, setFdRate] =
    useState(
      localStorage.getItem(
        "fdRate"
      ) || 7
    );

  const saveSettings = () => {

  const rate =
    Number(fdRate);

  if (
    rate < 1 ||
    rate > 15
  ) {

    alert(
      "Please enter FD rate between 1% and 15%"
    );

    return;
  }

  localStorage.setItem(
    "fdRate",
    rate
  );

  alert(
    "Settings Saved Successfully"
  );
};

  return (
    <div className="flex bg-slate-950 text-white min-h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold mb-8">
          Settings
        </h1>

        <div className="bg-slate-900 p-6 rounded-xl max-w-xl">

          <h2 className="text-2xl font-bold mb-6">
            FD Comparison Settings
          </h2>

          <div className="mb-6">

            <label className="block mb-2">
              FD Interest Rate (%)
            </label>

            <input
              type="number"
              value={fdRate}
              onChange={(e) =>
                setFdRate(
                  e.target.value
                )
              }
              className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
            />
            <p className="text-gray-400 mt-2">
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
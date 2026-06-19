import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

import {
  getPortfolioSummary
} from "../services/portfolioService";

import {
  getCurrentUser,
  waitForAuth
} from "../services/authService";

export default function Dashboard() {

  const [loading,
    setLoading] =
    useState(true);

  const [summary,
    setSummary] =
    useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary =
    async () => {

      try {

        let user =
          getCurrentUser();

        if (!user) {

          user =
            await waitForAuth();
        }

        if (!user)
          return;

        const data =
          await getPortfolioSummary(
            user.uid
          );

        setSummary(
          data
        );

        setLoading(
          false
        );

      } catch (
        error
      ) {

        console.error(
          error
        );

        setLoading(
          false
        );
      }
    };

  if (
    loading
  ) {

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Portfolio...
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 text-white min-h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-5">

          <StatCard
            title="Total Invested"
            value={`₹${summary.totalInvested.toFixed(0)}`}
          />

          <StatCard
            title="Current Value"
            value={`₹${summary.currentValue.toFixed(0)}`}
          />

          <StatCard
            title="Profit / Loss"
            value={`₹${summary.profitLoss.toFixed(0)}`}
          />

          <StatCard
            title="Return %"
            value={`${summary.returnPercent.toFixed(2)}%`}
          />

          <StatCard
            title="CAGR"
            value="Coming Soon"
          />

          <StatCard
            title="XIRR"
            value="Coming Soon"
          />

        </div>

      </div>

    </div>
  );
}
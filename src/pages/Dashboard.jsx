import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import PortfolioGrowthChart from "../components/PortfolioGrowthChart";
import PortfolioVsNiftyChart from "../components/PortfolioVsNiftyChart";
import TopHoldings from "../components/TopHoldings";

import {
  getInvestments,
  getPortfolioHoldings,
  computeSummaryFromHoldings
} from "../services/portfolioService";

import { getPortfolioHistory } from "../services/portfolioHistoryService";

import { getCurrentUser, waitForAuth } from "../services/authService";

import { calculatePortfolioFDValue } from "../services/fdService";

import { calculateWeightedCAGR } from "../utils/cagr";

import { calculateXIRRFromTransactions } from "../utils/xirr";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";

import { getNiftyData } from "../services/niftyService";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [fdValue, setFdValue] = useState(0);
  const [mfVsFd, setMfVsFd] = useState(0);
  const [cagr, setCagr] = useState(0);
  const [xirr, setXirr] = useState(0);

  const [userName, setUserName] = useState("");

  const [bestFund, setBestFund] = useState(null);
  const [worstFund, setWorstFund] = useState(null);
  const [fundCount, setFundCount] = useState(0);
  const [holdings, setHoldings] = useState([]);

  const [chartData, setChartData] = useState([]);
  const [chartMode, setChartMode] = useState("growth");
  const [niftyData, setNiftyData] = useState([]);
  const [timeframe, setTimeframe] = useState("1M");

  const [portfolioHistory, setPortfolioHistory] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, [timeframe]);

  const loadDashboard = async () => {
    try {
      let user = getCurrentUser();

      if (!user) {
        user = await waitForAuth();
      }

      if (!user) return;

      // Display Name for the "Welcome, {name}" header.
      setUserName(user.displayName || user.email || "");

      // ==============================
      // Summary is derived directly from live holdings (not a Firestore
      // cache) so it can never drift from the numbers shown elsewhere.
      // ==============================

      const transactions = await getInvestments(user.uid);

      const history = await getPortfolioHistory(user.uid, timeframe);
      setPortfolioHistory(history);

      const portfolioHoldings = await getPortfolioHoldings(user.uid);
      setHoldings(portfolioHoldings);
      setFundCount(portfolioHoldings.length);

      const summaryData = computeSummaryFromHoldings(portfolioHoldings);

      if (portfolioHoldings.length > 0) {
        const sorted = [...portfolioHoldings].sort(
          (a, b) => b.returnPercent - a.returnPercent
        );

        setBestFund(sorted[0]);
        setWorstFund(sorted[sorted.length - 1]);
      }

      const growthData = history.map((item, index) => ({
        point: index + 1,
        date: new Date(item.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "2-digit"
        }),
        value: item.portfolio
      }));

      setChartData(growthData);

      const fdAmount = calculatePortfolioFDValue(
        transactions,
        Number(localStorage.getItem("fdRate") || 7)
      );

      // Accurate transaction-based CAGR/XIRR (money-weighted, not a
      // single-date lump-sum approximation).
      const cagrValue = calculateWeightedCAGR(
        transactions,
        summaryData.currentValue
      );

      const xirrValue = calculateXIRRFromTransactions(
        transactions,
        summaryData.currentValue
      );

      const periodMap = {
        "1D": "1d",
        "1W": "1wk",
        "1M": "1mo",
        "6M": "6mo",
        "1Y": "1y",
        ALL: "max"
      };

      const nifty = await getNiftyData(periodMap[timeframe]);

      const firstClose = nifty[0]?.close || 1;
      const invested = summaryData.totalInvested;

      const portfolioMap = {};
      history.forEach((item) => {
        portfolioMap[item.date] = item.portfolio;
      });

      const niftyChartData = nifty.map((item) => {
        const niftyValue = invested * (item.close / firstClose);

        return {
          month: new Date(item.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
          }),
          date: item.date,
          actualNifty: item.close,
          nifty: Number(niftyValue.toFixed(2)),
          portfolio: portfolioMap[item.date] ?? null
        };
      });

      setNiftyData(niftyChartData);

      // FD Value / MF vs FD use the real, Settings-rate-driven FD
      // calculation — this can never fall below the invested amount.
      setSummary(summaryData);
      setFdValue(fdAmount);
      setMfVsFd(summaryData.currentValue - fdAmount);
      setCagr(cagrValue);
      setXirr(xirrValue);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
      >
        Fetching Portfolio...
      </div>
    );
  }

  // Hybrid included as its own slice so allocation always adds up to
  // 100% even when a Hybrid/balanced fund is held.
  const allocationData = [
    { name: "Equity", value: summary?.equityValue || 0 },
    { name: "Debt", value: summary?.debtValue || 0 },
    { name: "Liquid", value: summary?.liquidValue || 0 },
    { name: "Hybrid", value: summary?.hybridValue || 0 }
  ].filter((item) => item.value > 0);

  const COLORS = {
    Equity: "#C9A24B",
    Debt: "#7C93C7",
    Liquid: "#7FD8B0",
    Hybrid: "#B5836B"
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="font-display text-4xl mb-8">
          Welcome{userName ? `, ${userName}` : ""}
        </h1>

        <div className="grid grid-cols-4 gap-5">
          <StatCard
            title="Total Invested"
            value={`₹${summary.totalInvested.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
          />

          <StatCard
            title="Current Value"
            value={`₹${summary.currentValue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
          />

          <StatCard
            title="Profit / Loss"
            value={`₹${summary.profitLoss.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
          />

          <StatCard
            title="Return %"
            value={`${summary.returnPercent.toFixed(2)}%`}
          />

          <StatCard
            title="FD Value"
            value={`₹${fdValue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
          />

          <StatCard
            title="MF vs FD"
            value={`₹${mfVsFd.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
          />

          <StatCard title="CAGR" value={`${cagr.toFixed(2)}%`} />

          <StatCard title="XIRR" value={`${xirr.toFixed(2)}%`} />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6">
          <div
            className="rounded-xl p-6"
            style={{ background: "var(--bg-surface)" }}
          >
            <h2 className="font-display text-2xl mb-5">Portfolio Allocation</h2>

            <div
              className="w-full"
              style={{
                height: "350px",
                minHeight: "350px"
              }}
            >
              <ResponsiveContainer width="99%" height={350}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className="rounded-xl p-6"
            style={{ background: "var(--bg-surface)" }}
          >
            <h2 className="font-display text-2xl mb-5">Allocation Breakdown</h2>

            <div className="space-y-5">
              <div
                className="p-4 rounded-lg"
                style={{ background: "var(--bg-surface-2)" }}
              >
                <p style={{ color: "var(--text-secondary)" }}>Equity</p>
                <p className="font-mono text-xl font-semibold">
                  ₹
                  {summary.equityValue?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="font-mono" style={{ color: COLORS.Equity }}>
                  {summary.equityPercent?.toFixed(2)}%
                </p>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ background: "var(--bg-surface-2)" }}
              >
                <p style={{ color: "var(--text-secondary)" }}>Debt</p>
                <p className="font-mono text-xl font-semibold">
                  ₹
                  {summary.debtValue?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="font-mono" style={{ color: COLORS.Debt }}>
                  {summary.debtPercent?.toFixed(2)}%
                </p>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ background: "var(--bg-surface-2)" }}
              >
                <p style={{ color: "var(--text-secondary)" }}>Liquid</p>
                <p className="font-mono text-xl font-semibold">
                  ₹
                  {summary.liquidValue?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="font-mono" style={{ color: COLORS.Liquid }}>
                  {summary.liquidPercent?.toFixed(2)}%
                </p>
              </div>

              {summary.hybridValue > 0 && (
                <div
                  className="p-4 rounded-lg"
                  style={{ background: "var(--bg-surface-2)" }}
                >
                  <p style={{ color: "var(--text-secondary)" }}>Hybrid</p>
                  <p className="font-mono text-xl font-semibold">
                    ₹
                    {summary.hybridValue?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <p className="font-mono" style={{ color: COLORS.Hybrid }}>
                    {summary.hybridPercent?.toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setChartMode("growth")}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background:
                  chartMode === "growth" ? "var(--accent)" : "var(--bg-surface-2)",
                color: chartMode === "growth" ? "var(--accent-text)" : "var(--text-primary)"
              }}
            >
              📈 My Portfolio
            </button>

            <button
              onClick={() => setChartMode("nifty")}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background:
                  chartMode === "nifty" ? "var(--accent)" : "var(--bg-surface-2)",
                color: chartMode === "nifty" ? "var(--accent-text)" : "var(--text-primary)"
              }}
            >
              📊 Vs NIFTY
            </button>
          </div>

          {chartMode === "growth" ? (
            <PortfolioGrowthChart data={portfolioHistory} />
          ) : (
            <PortfolioVsNiftyChart
              data={niftyData}
              portfolioValue={
                portfolioHistory.length
                  ? portfolioHistory[portfolioHistory.length - 1].portfolio
                  : summary.currentValue
              }
              niftyValue={
                niftyData.length
                  ? niftyData[niftyData.length - 1].nifty
                  : 0
              }
              portfolioReturn={
                portfolioHistory.length
                  ? portfolioHistory[portfolioHistory.length - 1]
                      .returnPercent
                  : summary.returnPercent
              }
            />
          )}

          <div className="flex justify-center mb-4">
            <div
              className="p-1 rounded-xl flex flex-wrap gap-1"
              style={{ background: "var(--bg-surface-2)" }}
            >
              {["1D", "1W", "1M", "6M", "1Y", "ALL"].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background:
                      timeframe === period ? "var(--accent)" : "transparent",
                    color:
                      timeframe === period
                        ? "var(--accent-text)"
                        : "var(--text-secondary)"
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6">
            <div
              className="rounded-xl p-6"
              style={{ background: "var(--bg-surface)" }}
            >
              <h2 className="font-display text-2xl mb-6">Portfolio Insights</h2>

              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg"
                  style={{ background: "var(--bg-surface-2)" }}
                >
                  <p style={{ color: "var(--text-secondary)" }}>
                    Total Funds
                  </p>
                  <p className="font-mono text-3xl font-semibold">{fundCount}</p>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{ background: "var(--bg-surface-2)" }}
                >
                  <p style={{ color: "var(--text-secondary)" }}>
                    Best Performer
                  </p>
                  <p className="font-bold">{bestFund?.fundName}</p>
                  <p className="font-mono" style={{ color: "var(--gain)" }}>
                    {bestFund?.returnPercent?.toFixed(2)}%
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{ background: "var(--bg-surface-2)" }}
                >
                  <p style={{ color: "var(--text-secondary)" }}>
                    Worst Performer
                  </p>
                  <p className="font-bold">{worstFund?.fundName}</p>
                  <p className="font-mono" style={{ color: "var(--loss)" }}>
                    {worstFund?.returnPercent?.toFixed(2)}%
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{ background: "var(--bg-surface-2)" }}
                >
                  <p style={{ color: "var(--text-secondary)" }}>
                    Portfolio Health
                  </p>
                  <p className="text-xl font-bold">
                    {fundCount >= 7
                      ? "Excellent"
                      : fundCount >= 4
                      ? "Good"
                      : fundCount >= 2
                      ? "Average"
                      : "Poor"}
                  </p>
                </div>
              </div>
            </div>

            <TopHoldings holdings={holdings} />
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import PortfolioGrowthChart from "../components/PortfolioGrowthChart";
import PortfolioVsNiftyChart from "../components/PortfolioVsNiftyChart";
import TopHoldings
from "../components/TopHoldings";

import {
  getPortfolioSummary,
  getInvestments,
  getPortfolioHoldings
} from "../services/portfolioService";
import {
  getCurrentUser,
  waitForAuth
} from "../services/authService";

import {
  calculatePortfolioFDValue
} from "../services/fdService";

import {
  calculateCAGR
} from "../utils/cagr";

import {
  calculateXIRR
} from "../utils/xirr";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";

export default function Dashboard() {

  const [loading, setLoading] =
    useState(true);

  const [summary, setSummary] =
    useState(null);

  const [fdValue, setFdValue] =
    useState(0);

  const [mfVsFd, setMfVsFd] =
    useState(0);

  const [cagr, setCagr] =
    useState(0);

  const [xirr, setXirr] =
    useState(0);
  
  const [bestFund, setBestFund] =
  useState(null);

const [worstFund, setWorstFund] =
  useState(null);

const [fundCount, setFundCount] =
  useState(0);

const [holdings, setHoldings] =
  useState([]);

  const [chartData, setChartData] =
    useState([]);

  const [chartMode, setChartMode] =
  useState("growth");

const [timeframe, setTimeframe] =
  useState("30D");
  const niftyData = [
  {
    month: "15 Feb",
    portfolio: 100,
    nifty: 100
  },
  {
    month: "01 Mar",
    portfolio: 104,
    nifty: 102
  },
  {
    month: "15 Mar",
    portfolio: 108,
    nifty: 105
  },
  {
    month: "01 Apr",
    portfolio: 112,
    nifty: 108
  },
  {
    month: "15 Apr",
    portfolio: 118,
    nifty: 111
  },
  {
    month: "01 May",
    portfolio: 122,
    nifty: 113
  },
  {
    month: "15 May",
    portfolio: 126,
    nifty: 115
  },
  {
    month: "01 Jun",
    portfolio: 130,
    nifty: 118
  }
];
const getFilteredNiftyData =
  () => {

    switch (
      timeframe
    ) {

      case "1D":
        return niftyData.slice(-2);

      case "7D":
        return niftyData.slice(-3);

      case "30D":
        return niftyData.slice(-4);

      case "90D":
        return niftyData.slice(-5);

      case "180D":
        return niftyData.slice(-6);

      default:
        return niftyData;
    }

  };
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard =
    async () => {

      try {

        let user =
          getCurrentUser();

        if (!user) {
          user =
            await waitForAuth();
        }

        if (!user) return;

        const summaryData =
          await getPortfolioSummary(
            user.uid
          );

        const transactions =
          await getInvestments(
            user.uid
          );

       const portfolioHoldings =
  await getPortfolioHoldings(
    user.uid
  );

setHoldings(
  portfolioHoldings
);

setFundCount(
  portfolioHoldings.length
);

if (
  portfolioHoldings.length > 0
) {

  const sorted =
    [...portfolioHoldings]
      .sort(
        (a, b) =>
          b.returnPercent -
          a.returnPercent
      );

  setBestFund(
    sorted[0]
  );

  setWorstFund(
    sorted[
      sorted.length - 1
    ]
  );
}

const sortedTransactions =
  [...transactions]
    .sort(
      (a, b) =>
        new Date(
          a.date
        ) -
        new Date(
          b.date
        )
    );

let runningTotal = 0;
const growthData =
  sortedTransactions.map(
    (txn, index) => {

      runningTotal +=
        Number(
          txn.amount
        );

      return {
  point: index + 1,
  date: new Date(txn.date).toLocaleDateString("en-IN"),
  value: runningTotal
};

    }
  );

console.log(
  growthData
);

setChartData(
  growthData
);
        const fdAmount =
          calculatePortfolioFDValue(
            transactions,
            Number(
              localStorage.getItem(
                "fdRate"
              ) || 7
            )
          );

        let oldestDate =
          null;

        if (
          transactions.length > 0
        ) {

          oldestDate =
            transactions
              .map(
                item =>
                  item.date
              )
              .sort()[0];
        }

        const cagrValue =
          calculateCAGR(
            summaryData.totalInvested,
            summaryData.currentValue,
            oldestDate
          );

        const xirrValue =
          calculateXIRR(
            summaryData.totalInvested,
            summaryData.currentValue,
            oldestDate
          );

        setSummary(
          summaryData
        );

        setFdValue(
          fdAmount
        );

        setMfVsFd(
          summaryData.currentValue -
          fdAmount
        );

        setCagr(
          cagrValue
        );

        setXirr(
          xirrValue
        );

        setLoading(
          false
        );

      } catch (error) {

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

  const allocationData = [
    {
      name: "Equity",
      value:
        summary?.equityValue || 0
    },
    {
      name: "Debt",
      value:
        summary?.debtValue || 0
    },
    {
      name: "Liquid",
      value:
        summary?.liquidValue || 0
    }
  ];

  const COLORS = [
    "#3B82F6",
    "#F59E0B",
    "#10B981"
  ];

  return (
    <div className="flex bg-slate-950 text-white min-h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-4 gap-5">

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
            title="FD Value"
            value={`₹${fdValue.toFixed(0)}`}
          />

          <StatCard
            title="MF vs FD"
            value={`₹${mfVsFd.toFixed(0)}`}
          />

          <StatCard
            title="CAGR"
            value={`${cagr}%`}
          />

          <StatCard
            title="XIRR"
            value={`${xirr}%`}
          />

        </div>

        <div className="mt-10 grid grid-cols-2 gap-6">

          <div className="bg-slate-900 rounded-xl p-6">

            <h2 className="text-2xl font-bold mb-5">
              Portfolio Allocation
            </h2>

            <div
  className="w-full"
  style={{
    height: "350px",
    minHeight: "350px"
  }}
>

  <ResponsiveContainer
    width="99%"
    height={350}
  >

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

                    {allocationData.map(
                      (entry, index) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[index]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
  formatter={(value) =>
    `₹${Number(value).toLocaleString("en-IN")}`
  }
/>

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

          <div className="bg-slate-900 rounded-xl p-6">

            <h2 className="text-2xl font-bold mb-5">
              Allocation Breakdown
            </h2>

            <div className="space-y-5">

              <div className="bg-slate-800 p-4 rounded-lg">

                <p className="text-gray-400">
                  Equity
                </p>

                <p className="text-xl font-bold">
                  ₹{summary.equityValue?.toFixed(0)}
                </p>

                <p className="text-green-400">
                  {summary.equityPercent?.toFixed(2)}%
                </p>

              </div>

              <div className="bg-slate-800 p-4 rounded-lg">

                <p className="text-gray-400">
                  Debt
                </p>

                <p className="text-xl font-bold">
                  ₹{summary.debtValue?.toFixed(0)}
                </p>

                <p className="text-yellow-400">
                  {summary.debtPercent?.toFixed(2)}%
                </p>

              </div>

              <div className="bg-slate-800 p-4 rounded-lg">

                <p className="text-gray-400">
                  Liquid
                </p>

                <p className="text-xl font-bold">
                  ₹{summary.liquidValue?.toFixed(0)}
                </p>

                <p className="text-cyan-400">
                  {summary.liquidPercent?.toFixed(2)}%
                </p>

              </div>

            </div>

          </div>

        </div>

        <div className="mt-10">

          <div className="mb-6 flex gap-3">

  <button
    onClick={() =>
      setChartMode(
        "growth"
      )
    }
    className={`px-4 py-2 rounded-lg ${
      chartMode ===
      "growth"
        ? "bg-blue-600"
        : "bg-slate-800"
    }`}
  >
    📈 My Portfolio
  </button>

  <button
    onClick={() =>
      setChartMode(
        "nifty"
      )
    }
    className={`px-4 py-2 rounded-lg ${
      chartMode ===
      "nifty"
        ? "bg-blue-600"
        : "bg-slate-800"
    }`}
  >
    
    📊 Vs NIFTY
  </button>

</div>

{
  chartMode ===
  "growth" ? (

    <PortfolioGrowthChart
      data={chartData}
    />

  ) : (

   <PortfolioVsNiftyChart
  data={getFilteredNiftyData()}
  portfolioValue={summary.currentValue}
  niftyValue={fdValue}
  portfolioReturn={summary.returnPercent}
/>

  )
}
      <div className="flex justify-center mb-4">

  <div className="bg-slate-800 p-1 rounded-xl flex flex-wrap gap-1">

    {[
      "1D",
      "7D",
      "30D",
      "90D",
      "180D",
      "365D"
    ].map((period) => (

      <button
        key={period}
        onClick={() =>
          setTimeframe(period)
        }
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          timeframe === period
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-300 hover:bg-slate-700"
        }`}
      >
        {period}
      </button>

    ))}

  </div>

</div>
<div className="mt-10 grid grid-cols-2 gap-6">

  <div className="bg-slate-900 rounded-xl p-6">

    <h2 className="text-2xl font-bold mb-6">
      Portfolio Insights
    </h2>

    <div className="space-y-4">

      <div className="bg-slate-800 p-4 rounded-lg">

        <p className="text-gray-400">
          Total Funds
        </p>

        <p className="text-3xl font-bold">
          {fundCount}
        </p>

      </div>

      <div className="bg-slate-800 p-4 rounded-lg">

        <p className="text-gray-400">
          Best Performer
        </p>

        <p className="font-bold">
          {
            bestFund?.fundName
          }
        </p>

        <p className="text-green-400">
          {
            bestFund?.returnPercent?.toFixed(
              2
            )
          }
          %
        </p>

      </div>

      <div className="bg-slate-800 p-4 rounded-lg">

        <p className="text-gray-400">
          Worst Performer
        </p>

        <p className="font-bold">
          {
            worstFund?.fundName
          }
        </p>

        <p className="text-red-400">
          {
            worstFund?.returnPercent?.toFixed(
              2
            )
          }
          %
        </p>

      </div>

      <div className="bg-slate-800 p-4 rounded-lg">

        <p className="text-gray-400">
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

  <TopHoldings
    holdings={holdings}
  />

</div>

        </div>

      </div>

    </div>
  );
}
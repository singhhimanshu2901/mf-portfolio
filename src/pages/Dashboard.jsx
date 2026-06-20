import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import PortfolioGrowthChart from "../components/PortfolioGrowthChart";

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

  

        const monthlyData = {};

        transactions.forEach(
          (txn) => {

            const date =
              new Date(
                txn.date
              );

            const month =
              date.toLocaleString(
                "default",
                {
                  month: "short"
                }
              );

            if (
              !monthlyData[
                month
              ]
            ) {
              monthlyData[
                month
              ] = 0;
            }

            monthlyData[
              month
            ] += Number(
              txn.amount
            );
          }
        );

        const growthData =
          Object.entries(
            monthlyData
          ).map(
            ([month, value]) => ({
              month,
              value
            })
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

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
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
                      `₹${Number(value).toFixed(0)}`
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

          <PortfolioGrowthChart
            data={chartData}
          />
          
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
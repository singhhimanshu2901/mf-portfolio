import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
// ADD IMPORT

import TransactionAnalyticsTable
from "../components/TransactionAnalyticsTable";

import {
  getHoldingBySchemeCode,
  getFundTransactions
} from "../services/portfolioService";
import FundNavChart from "../components/FundNavChart";

import {
  getNavHistory
} from "../services/navHistoryService";

import {
  getPortfolioHistory
} from "../services/portfolioHistoryService";

import {
  getCurrentUser,
  waitForAuth
} from "../services/authService";

import {
  calculateCAGR
} from "../utils/cagr";

import {
  calculateXIRR
} from "../utils/xirr";

export default function FundDetails() {

  const { schemeCode } =
    useParams();

  const [loading,
    setLoading] =
    useState(true);

  const [holding,
    setHolding] =
    useState(null);

  const [transactions,
    setTransactions] =
    useState([]);

  const [history,
    setHistory] =
    useState([]);

  const [timeframe,
    setTimeframe] =
    useState("1Y");

  const loadFund =
    async () => {

      try {

        setLoading(true);

        let user =
          getCurrentUser();

        if (!user) {

          user =
            await waitForAuth();

        }

        if (!user) {

          setLoading(false);

          return;

        }

        // With this

const [

  holdingData,

  transactionData,

  historyData

] = await Promise.all([

  getHoldingBySchemeCode(

    user.uid,

    schemeCode

  ),

  getFundTransactions(

    user.uid,

    schemeCode

  ),

  getNavHistory(

    schemeCode

  )

]);

        setHolding(
          holdingData
        );

        setTransactions(
          transactionData
        );

       // With

const filteredHistory =

  historyData.filter(item => {

    if (

      timeframe === "ALL"

    ) {

      return true;

    }

    const today =
      new Date();

    const date =
      new Date(item.date);

    let days = 365;

    if (
      timeframe === "1M"
    ) {

      days = 30;

    }

    else if (
      timeframe === "6M"
    ) {

      days = 180;

    }

    return (

      today - date <=

      days *

      24 *

      60 *

      60 *

      1000

    );

  });

setHistory(
  filteredHistory
);

      }

      finally {

        setLoading(false);

      }

    };

  useEffect(() => {

    loadFund();

  }, [

    schemeCode,

    timeframe

  ]);

  const analytics =
    useMemo(() => {

      if (

        !holding ||

        !transactions.length

      ) {

        return {

          cagr: 0,

          xirr: 0,

          firstDate: null,

          lastDate: null

        };

      }

      const firstDate =

        transactions[0].date;

      const lastDate =

        transactions[
          transactions.length - 1
        ].date;

      return {

        cagr:

          calculateCAGR(

            holding.invested,

            holding.currentValue,

            firstDate

          ),

        xirr:

          calculateXIRR(

            holding.invested,

            holding.currentValue,

            firstDate

          ),

        firstDate,

        lastDate

      };

    }, [

      holding,

      transactions

    ]);

  const formatCurrency =
    value =>

      `₹${Number(

        value || 0

      ).toLocaleString(

        "en-IN",

        {

          maximumFractionDigits: 0

        }

      )}`;

  if (

    loading

  ) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">

        Loading Fund...

      </div>

    );

  }

  if (

    !holding

  ) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">

        Fund not found.

      </div>

    );

  }
    return (

    <div className="flex min-h-screen bg-slate-950 text-white">

      <Sidebar />

      <main className="flex-1 p-8">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

          <div>

            <p className="text-sm text-slate-400">

              Mutual Fund Details

            </p>

            <h1 className="text-4xl font-bold mt-2">

              {holding.fundName}

            </h1>

            <p className="text-slate-400 mt-2">

              {holding.category}

            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            {

              [

                "1M",

                "6M",

                "1Y",

                "ALL"

              ].map(period => (

                <button

                  key={period}

                  onClick={() =>

                    setTimeframe(
                      period
                    )

                  }

                  className={`px-5 py-2 rounded-lg transition-all duration-300 ${
                    timeframe === period
                      ? "bg-blue-600"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}

                >

                  {period}

                </button>

              ))

            }

          </div>

        </div>

        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5">

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              Invested

            </p>

            <h2 className="text-3xl font-bold mt-2">

              {formatCurrency(

                holding.invested

              )}

            </h2>

          </div>

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              Current Value

            </p>

            <h2 className="text-3xl font-bold mt-2">

              {formatCurrency(

                holding.currentValue

              )}

            </h2>

          </div>

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              Current NAV

            </p>

            <h2 className="text-3xl font-bold mt-2 text-cyan-400">

              ₹

              {holding.currentNav.toFixed(
                2
              )}

            </h2>

            <p className="text-xs text-slate-500 mt-2">

              {holding.navDate}

            </p>

          </div>

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              Profit / Loss

            </p>

            <h2

              className={`text-3xl font-bold mt-2 ${
                holding.profit >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}

            >

              {formatCurrency(

                holding.profit

              )}

            </h2>

            <p

              className={`mt-2 ${
                holding.returnPercent >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}

            >

              {holding.returnPercent}%

            </p>

          </div>

        </div>

        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5 mt-6">

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              Units

            </p>

            <h3 className="text-2xl font-bold mt-2">

              {holding.units.toFixed(3)}

            </h3>

          </div>

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              Average Buy NAV

            </p>

            <h3 className="text-2xl font-bold mt-2">

              ₹

              {holding.averageBuyNav.toFixed(
                2
              )}

            </h3>

          </div>

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              First Investment

            </p>

            <h3 className="text-xl font-semibold mt-2">

              {analytics.firstDate}

            </h3>

          </div>

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              Transactions

            </p>

            <h3 className="text-2xl font-bold mt-2">

              {transactions.length}

            </h3>

          </div>

        </div>
                <div className="bg-slate-900 rounded-2xl p-6 mt-8">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold">

              NAV History

            </h2>

            <div className="text-sm text-slate-400">

              Performance Trend

            </div>

          </div>

          <FundNavChart

  data={history}

/>



        </div>

        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5 mt-8">

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              CAGR

            </p>

            <h2 className="text-3xl font-bold mt-2">

              {analytics.cagr.toFixed(2)}%

            </h2>

          </div>

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              XIRR

            </p>

            <h2 className="text-3xl font-bold mt-2">

              {analytics.xirr.toFixed(2)}%

            </h2>

          </div>

          <div className="bg-slate-900 rounded-2xl p-6">

  <p className="text-slate-400">

    Return %

  </p>

  <h3

    className={`text-2xl font-bold mt-2 ${
      holding.returnPercent >= 0
        ? "text-green-400"
        : "text-red-400"
    }`}

  >

    {holding.returnPercent.toFixed(2)}%

  </h3>

</div>

          <div className="bg-slate-900 rounded-2xl p-6">

            <p className="text-slate-400">

              Last Investment

            </p>

            <h2 className="text-xl font-semibold mt-2">

              {analytics.lastDate}

            </h2>

          </div>

        </div>





<div className="mt-8">

  <TransactionAnalyticsTable

    transactions={transactions}

    currentNav={holding.currentNav}

  />

</div>

      </main>

    </div>

  );

}
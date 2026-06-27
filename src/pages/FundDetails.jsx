import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import FundAnalytics from "../components/FundAnalytics";
import FundNavChart from "../components/FundNavChart";
import TransactionAnalyticsTable from "../components/TransactionAnalyticsTable";

import {
  getHoldingBySchemeCode,
  getFundTransactions
} from "../services/portfolioService";

import {
  getNavHistory
} from "../services/navHistoryService";

import {
  getCurrentUser,
  waitForAuth
} from "../services/authService";

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

            let days =
              365;

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

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">

        Loading Fund...

      </div>

    );

  }

  if (!holding) {

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

        {/* ============================ */}
        {/* Header */}
        {/* ============================ */}

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

        {/* ============================ */}
        {/* Analytics */}
        {/* ============================ */}

        <FundAnalytics

          holding={holding}

          transactions={transactions}

          history={history}

        />

        {/* ============================ */}
        {/* NAV History */}
        {/* ============================ */}

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

        {/* ============================ */}
        {/* Transaction Analytics */}
        {/* ============================ */}

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
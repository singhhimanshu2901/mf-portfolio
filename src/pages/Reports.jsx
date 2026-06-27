import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import {

  getPortfolioSummary,

  getPortfolioHoldings,

  getInvestments

} from "../services/portfolioService";

import {

  getCurrentUser,

  waitForAuth

} from "../services/authService";

import {

  calculatePortfolioFDValue

} from "../services/fdService";

import {

  generatePortfolioPDF

} from "../utils/reportGenerator";

export default function Reports() {

  const [

    summary,

    setSummary

  ] = useState(null);

  const [

    holdings,

    setHoldings

  ] = useState([]);

  const [

    transactions,

    setTransactions

  ] = useState([]);

  const [

    fdValue,

    setFdValue

  ] = useState(0);

  const [

    loading,

    setLoading

  ] = useState(true);

  useEffect(() => {

    loadReport();

  }, []);

  const loadReport = async () => {

    try {

      setLoading(true);

      let user =

        getCurrentUser();

      if (!user) {

        user =

          await waitForAuth();

      }

      if (!user) return;

      const [

        summaryData,

        holdingsData,

        transactionData

      ] = await Promise.all([

        getPortfolioSummary(

          user.uid

        ),

        getPortfolioHoldings(

          user.uid

        ),

        getInvestments(

          user.uid

        )

      ]);

      const fdAmount =

        calculatePortfolioFDValue(

          transactionData,

          Number(

            localStorage.getItem(

              "fdRate"

            ) || 7

          )

        );

      setSummary(

        summaryData

      );

      setHoldings(

        holdingsData.sort(

          (a, b) =>

            b.returnPercent -

            a.returnPercent

        )

      );

      setTransactions(

        transactionData

      );

      setFdValue(

        fdAmount

      );

    }

    finally {

      setLoading(false);

    }

  };
    if (

    loading ||

    !summary

  ) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-2xl">

        Loading Reports...

      </div>

    );

  }

  return (

    <div className="flex min-h-screen bg-slate-950 text-white">

      <Sidebar />

      <main className="flex-1 p-8">

        <div className="mb-10">

          <h1 className="text-4xl font-bold">

            Reports Center

          </h1>

          <p className="text-slate-400 mt-3">

            Generate professional PDF reports for your mutual fund portfolio.

          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Portfolio Report */}

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

            <div className="text-5xl">

              📄

            </div>

            <h2 className="text-2xl font-bold mt-5">

              Portfolio Report

            </h2>

            <p className="text-slate-400 mt-4 leading-7">

              Generate a professional PDF report containing portfolio summary,

              holdings analysis, MF vs FD comparison, portfolio health,

              automatic insights and complete performance statistics.

            </p>

            <div className="mt-8 space-y-4">

              <div className="flex justify-between">

                <span>Total Funds</span>

                <span className="font-semibold">

                  {holdings.length}

                </span>

              </div>

              <div className="flex justify-between">

                <span>Total Invested</span>

                <span className="font-semibold">

                  ₹{summary.totalInvested.toLocaleString("en-IN")}

                </span>

              </div>

              <div className="flex justify-between">

                <span>Current Value</span>

                <span className="font-semibold text-green-400">

                  ₹{summary.currentValue.toLocaleString("en-IN")}

                </span>

              </div>

              <div className="flex justify-between">

                <span>Return</span>

                <span

                  className={`font-semibold ${
                    summary.returnPercent >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}

                >

                  {summary.returnPercent.toFixed(2)}%

                </span>

              </div>

            </div>

            <button

              onClick={() =>

                generatePortfolioPDF({

                  summary,

                  holdings,

                  transactions,

                  fdValue

                })

              }

              className="w-full mt-10 bg-blue-600 hover:bg-blue-700 transition-all rounded-xl py-4 font-bold text-lg"

            >

              Generate Portfolio PDF

            </button>

          </div>

          {/* Fund Report */}

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

            <div className="text-5xl">

              📑

            </div>

            <h2 className="text-2xl font-bold mt-5">

              Individual Fund Report

            </h2>

            <p className="text-slate-400 mt-4 leading-7">

              Generate detailed PDF reports for individual mutual funds including
              NAV history, transaction summary, XIRR, wealth multiplier,
              performance analytics and historical growth.

            </p>

            <div className="mt-10 rounded-xl bg-slate-800 p-8 text-center">

              <div className="text-4xl">

                🚧

              </div>

              <h3 className="mt-4 text-xl font-bold">

                Coming Soon

              </h3>

              <p className="text-slate-400 mt-3">

                This feature will be available in the next update.

              </p>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}
// src/components/FundAnalytics.jsx

import { useMemo } from "react";

export default function FundAnalytics({

  holding,

  transactions = [],

  history = []

}) {

  const analytics =
    useMemo(() => {

      if (

        !holding ||

        !transactions.length

      ) {

        return null;

      }

      const latestNavDate =

        history.length

          ? history[
              history.length - 1
            ].date

          : "--";

      const firstInvestment =

        transactions[0]?.date;

      const lastInvestment =

        transactions[
          transactions.length - 1
        ]?.date;

      const investmentAge = (() => {

        if (

          !firstInvestment

        ) {

          return "--";

        }

        const start =
          new Date(
            firstInvestment
          );

        const today =
          new Date();

        const totalMonths =

          (

            today.getFullYear() -

            start.getFullYear()

          ) * 12 +

          (

            today.getMonth() -

            start.getMonth()

          );

        const years =
          Math.floor(
            totalMonths / 12
          );

        const months =
          totalMonths % 12;

        if (

          years === 0

        ) {

          return `${months} Months`;

        }

        return `${years} Years ${months} Months`;

      })();

      const wealthMultiplier =

        holding.invested > 0

          ? holding.currentValue /

            holding.invested

          : 0;

      return {

        latestNavDate,

        investmentAge,

        firstInvestment,

        lastInvestment,

        wealthMultiplier

      };

    }, [

      holding,

      transactions,

      history

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

    !analytics

  ) {

    return null;

  }
    return (

    <div className="space-y-6">

      {/* ========================= */}
      {/* Row 1 */}
      {/* ========================= */}

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

          <h2 className="text-3xl font-bold text-cyan-400 mt-2">

            ₹

            {holding.currentNav.toFixed(

              2

            )}

          </h2>

          <p className="text-xs text-slate-500 mt-2">

            {analytics.latestNavDate}

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

            className={`mt-2 text-sm ${
              holding.returnPercent >= 0

                ? "text-green-400"

                : "text-red-400"

            }`}

          >

            {holding.returnPercent.toFixed(

              2

            )}%

          </p>

        </div>

      </div>

      {/* ========================= */}
      {/* Row 2 */}
      {/* ========================= */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5">

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">

            Units

          </p>

          <h2 className="text-3xl font-bold mt-2">

            {holding.units.toFixed(

              3

            )}

          </h2>

        </div>

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">

            Avg Buy NAV

          </p>

          <h2 className="text-3xl font-bold mt-2">

            ₹

            {holding.averageBuyNav.toFixed(

              2

            )}

          </h2>

        </div>

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">

            Return %

          </p>

          <h2

            className={`text-3xl font-bold mt-2 ${
              holding.returnPercent >= 0

                ? "text-green-400"

                : "text-red-400"

            }`}

          >

            {holding.returnPercent.toFixed(

              2

            )}%

          </h2>

        </div>

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">

            XIRR

          </p>

          <h2 className="text-3xl font-bold mt-2">

            {holding.xirr
              ? holding.xirr.toFixed(
                  2
                )
              : "0.00"}

            %

          </h2>

        </div>

      </div>
            {/* ========================= */}
      {/* Row 3 */}
      {/* ========================= */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5">

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">

            Investment Age

          </p>

          <h2 className="text-2xl font-bold mt-2">

            {analytics.investmentAge}

          </h2>

        </div>

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">

            First Investment

          </p>

          <h2 className="text-xl font-semibold mt-2">

            {analytics.firstInvestment}

          </h2>

        </div>

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">

            Last Investment

          </p>

          <h2 className="text-xl font-semibold mt-2">

            {analytics.lastInvestment}

          </h2>

        </div>

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">

            Wealth Multiplier

          </p>

          <h2 className="text-3xl font-bold text-cyan-400 mt-2">

            {analytics.wealthMultiplier.toFixed(

              2

            )}x

          </h2>

          <p className="text-sm text-slate-500 mt-2">

            ₹1 → ₹

            {analytics.wealthMultiplier.toFixed(

              2

            )}

          </p>

        </div>

      </div>

    </div>

  );

}
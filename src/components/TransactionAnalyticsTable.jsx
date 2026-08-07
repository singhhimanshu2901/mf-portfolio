// src/components/TransactionAnalyticsTable.jsx

import { useMemo } from "react";

export default function TransactionAnalyticsTable({

  transactions = [],

  currentNav = 0

}) {

  const analytics =
    useMemo(() => {

      let runningUnits = 0;

      let runningCost = 0;

      const rows = [];

      for (const txn of transactions) {

        const units =
          Number(
            txn.units || 0
          );

        const amount =
          Number(
            txn.amount || 0
          );

        const buyNav =
          Number(
            txn.purchaseNav || 0
          );

        runningUnits +=
          units;

        runningCost +=
          amount;

        const currentValue =
          units *
          currentNav;

        const gain =
          currentValue -
          amount;

        const gainPercent =
          amount > 0

            ? (

                gain /

                amount

              ) * 100

            : 0;

        rows.push({

          ...txn,

          units,

          amount,

          buyNav,

          runningUnits,

          runningCost,

          currentValue,

          gain,

          gainPercent

        });

      }

      const highestBuyNav =

        rows.length

          ? Math.max(

              ...rows.map(

                row => row.buyNav

              )

            )

          : 0;

      const lowestBuyNav =

        rows.length

          ? Math.min(

              ...rows.map(

                row => row.buyNav

              )

            )

          : 0;

      const averageBuyNav =

        runningUnits > 0

          ? runningCost /

            runningUnits

          : 0;

      return {

        rows,

        runningUnits,

        runningCost,

        highestBuyNav,

        lowestBuyNav,

        averageBuyNav

      };

    }, [

      transactions,

      currentNav

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
        return (

    <div className="bg-[var(--bg-surface)] rounded-2xl overflow-hidden">

      <div className="p-6 border-b border-[var(--border-color)]">

        <h2 className="font-display text-2xl">

          Transaction Analytics

        </h2>

      </div>

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4 p-6 border-b border-[var(--border-color)]">

        <div>

          <p className="text-[var(--text-secondary)] text-sm">

            Transactions

          </p>

          <h3 className="font-mono text-2xl font-semibold mt-2">

            {analytics.rows.length}

          </h3>

        </div>

        <div>

          <p className="text-[var(--text-secondary)] text-sm">

            Avg Buy NAV

          </p>

          <h3 className="font-mono text-2xl font-semibold mt-2">

            ₹

            {analytics.averageBuyNav.toFixed(2)}

          </h3>

        </div>

        <div>

          <p className="text-[var(--text-secondary)] text-sm">

            Highest Buy NAV

          </p>

          <h3 className="font-mono text-2xl font-semibold mt-2" style={{ color: "var(--gain)" }}>

            ₹

            {analytics.highestBuyNav.toFixed(2)}

          </h3>

        </div>

        <div>

          <p className="text-[var(--text-secondary)] text-sm">

            Lowest Buy NAV

          </p>

          <h3 className="font-mono text-2xl font-semibold mt-2" style={{ color: "var(--loss)" }}>

            ₹

            {analytics.lowestBuyNav.toFixed(2)}

          </h3>

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full min-w-[1400px]">

          <thead className="bg-[var(--bg-surface-2)]">

            <tr>

              <th className="px-5 py-4 text-left">

                Date

              </th>

              <th className="px-5 py-4 text-left">

                Type

              </th>

              <th className="px-5 py-4 text-right">

                Amount

              </th>

              <th className="px-5 py-4 text-right">

                Buy NAV

              </th>

              <th className="px-5 py-4 text-right">

                Current NAV

              </th>

              <th className="px-5 py-4 text-right">

                Units

              </th>

              <th className="px-5 py-4 text-right">

                Running Units

              </th>

              <th className="px-5 py-4 text-right">

                Running Cost

              </th>

              <th className="px-5 py-4 text-right">

                Current Value

              </th>

              <th className="px-5 py-4 text-right">

                Gain

              </th>

              <th className="px-5 py-4 text-center">

                Return %

              </th>

            </tr>

          </thead>

          <tbody>

            {analytics.rows.map(row => (

              <tr

                key={row.id}

                className="border-t border-[var(--border-color)] hover:bg-[var(--bg-surface-2)]"

              >

                <td className="px-5 py-4">

                  {row.date}

                </td>

                <td className="px-5 py-4">

                  {row.type}

                </td>

                <td className="px-5 py-4 text-right">

                  <span className="font-mono">{formatCurrency(row.amount)}</span>

                </td>

                <td className="px-5 py-4 text-right">

                  <span className="font-mono">₹{row.buyNav.toFixed(2)}</span>

                </td>

                <td className="px-5 py-4 text-right font-mono font-semibold" style={{ color: "var(--accent)" }}>

                  <span className="font-mono">₹{currentNav.toFixed(2)}</span>

                </td>

                <td className="px-5 py-4 text-right">

                  <span className="font-mono">{row.units.toFixed(3)}</span>

                </td>

                <td className="px-5 py-4 text-right">

                  <span className="font-mono">{row.runningUnits.toFixed(3)}</span>

                </td>

                <td className="px-5 py-4 text-right">

                  <span className="font-mono">{formatCurrency(row.runningCost)}</span>

                </td>

                <td className="px-5 py-4 text-right">

                  <span className="font-mono">{formatCurrency(row.currentValue)}</span>

                </td>

                <td

                  className="px-5 py-4 text-right font-semibold font-mono"
                  style={{ color: row.gain >= 0 ? "var(--gain)" : "var(--loss)" }}

                >

                  {formatCurrency(row.gain)}

                </td>

                <td className="px-5 py-4 text-center">

                  <span

                    className="inline-flex rounded-full px-3 py-1 text-sm font-semibold font-mono"
                    style={{
                      background: row.gainPercent >= 0 ? "#2f8f5e26" : "#c1503d26",
                      color: row.gainPercent >= 0 ? "var(--gain)" : "var(--loss)"
                    }}

                  >

                    {row.gainPercent >= 0 ? "+" : ""}

                    {row.gainPercent.toFixed(2)}%

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import {
  getInvestments
} from "../services/portfolioService";

import {
  getCurrentUser,
  waitForAuth
} from "../services/authService";

import { getNav } from "../services/navService";

export default function FundDetails() {

  const { schemeCode } = useParams();

  const [transactions, setTransactions] =
    useState([]);

  const [summary, setSummary] =
    useState(null);

  useEffect(() => {
    loadFund();
  }, []);

  const loadFund = async () => {

    let user = getCurrentUser();

    if (!user) {
      user = await waitForAuth();
    }

    if (!user) return;

    const allTransactions =
      await getInvestments(user.uid);

    const fundTransactions =
      allTransactions.filter(
        item =>
          String(item.schemeCode) ===
          String(schemeCode)
      );

    if (!fundTransactions.length)
      return;

    const invested =
      fundTransactions.reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

    const units =
      fundTransactions.reduce(
        (sum, item) =>
          sum + Number(item.units),
        0
      );

    const navData =
      await getNav(schemeCode);

    const currentNav =
      Number(navData.nav);

    const currentValue =
      units * currentNav;

    const profit =
      currentValue - invested;

    setSummary({
      fundName:
        fundTransactions[0].fundName,

      category:
        fundTransactions[0].category,

      invested,
      units,
      currentNav,
      currentValue,
      profit
    });

    setTransactions(
      fundTransactions
    );
  };

  if (!summary) {

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Fund...
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 text-white min-h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-3xl font-bold">
          {summary.fundName}
        </h1>

        <p className="mt-2 text-slate-400">
          {summary.category}
        </p>

        <div className="grid grid-cols-5 gap-4 mt-8">

          <div className="bg-slate-900 p-4 rounded">
            Invested
            <br />
            ₹{summary.invested.toFixed(0)}
          </div>

          <div className="bg-slate-900 p-4 rounded">
            Units
            <br />
            {summary.units.toFixed(2)}
          </div>

          <div className="bg-slate-900 p-4 rounded">
            Current NAV
            <br />
            ₹{summary.currentNav.toFixed(2)}
          </div>

          <div className="bg-slate-900 p-4 rounded">
            Current Value
            <br />
            ₹{summary.currentValue.toFixed(0)}
          </div>

          <div className="bg-slate-900 p-4 rounded">
            Profit
            <br />
            ₹{summary.profit.toFixed(0)}
          </div>

        </div>

        <div className="mt-10 bg-slate-900 rounded-xl overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-800">

              <tr>
                <th className="p-4 text-left">
                  Date
                </th>

                <th className="p-4 text-left">
                  Type
                </th>

                <th className="p-4 text-left">
                  Amount
                </th>

                <th className="p-4 text-left">
                  Purchase NAV
                </th>

                <th className="p-4 text-left">
                  Units
                </th>
              </tr>

            </thead>

            <tbody>

              {transactions.map(txn => (

                <tr
                  key={txn.id}
                  className="border-t border-slate-700"
                >

                  <td className="p-4">
                    {txn.date}
                  </td>

                  <td className="p-4">
                    {txn.type}
                  </td>

                  <td className="p-4">
                    ₹{txn.amount}
                  </td>

                  <td className="p-4">
                    ₹{txn.purchaseNav}
                  </td>

                  <td className="p-4">
                    {txn.units.toFixed(2)}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
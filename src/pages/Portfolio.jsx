import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  getPortfolioHoldings
} from "../services/portfolioService";

import {
  getCurrentUser,
  waitForAuth
} from "../services/authService";

export default function Portfolio() {

  const [holdings, setHoldings] =
    useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    let user = getCurrentUser();

    if (!user) {
      user = await waitForAuth();
    }

    if (!user) return;

    const data =
      await getPortfolioHoldings(
        user.uid
      );

    setHoldings(data);
  };

  return (
    <div className="flex bg-slate-950 text-white min-h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold mb-8">
          Portfolio Holdings
        </h1>

        <div className="bg-slate-900 rounded-xl overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-800">

              <tr>
                <th className="p-4 text-left">Fund</th>
                <th className="p-4 text-left">Invested</th>
                <th className="p-4 text-left">Units</th>
                <th className="p-4 text-left">NAV</th>
                <th className="p-4 text-left">Current Value</th>
                <th className="p-4 text-left">Profit</th>
                <th className="p-4 text-left">Return %</th>
              </tr>

            </thead>

            <tbody>

              {holdings.map((item) => (

                <tr
  key={item.schemeCode}
  className="border-t border-slate-700 cursor-pointer hover:bg-slate-800"
  onClick={() =>
    navigate(`/fund/${item.schemeCode}`)
  }
>

                  <td className="p-4">
                    {item.fundName}
                  </td>

                  <td className="p-4">
                    ₹{item.invested.toFixed(0)}
                  </td>

                  <td className="p-4">
                    {item.units.toFixed(2)}
                  </td>

                  <td className="p-4">
                    ₹{item.currentNav.toFixed(2)}
                  </td>

                  <td className="p-4">
                    ₹{item.currentValue.toFixed(0)}
                  </td>

                  <td className="p-4">
                    ₹{item.profit.toFixed(0)}
                  </td>

                  <td className="p-4">
                    {item.returnPercent.toFixed(2)}%
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
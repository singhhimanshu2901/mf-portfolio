import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { getPortfolioHoldings } from "../services/portfolioService";
import { getCurrentUser, waitForAuth } from "../services/authService";

export default function Portfolio() {
  const navigate = useNavigate();

  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("currentValue");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      let user = getCurrentUser();

      if (!user) {
        user = await waitForAuth();
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const data = await getPortfolioHoldings(user.uid);
      setHoldings(data);
    } finally {
      setLoading(false);
    }
  };

  const filteredHoldings = useMemo(() => {
    let data = [...holdings];

    if (search.trim()) {
      data = data.filter((item) =>
        item.fundName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "All") {
      data = data.filter((item) =>
        item.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    data.sort((a, b) => {
      let value = b[sortBy] - a[sortBy];
      if (sortOrder === "asc") value = -value;
      return value;
    });

    return data;
  }, [holdings, search, category, sortBy, sortOrder]);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0
    })}`;

  const inputStyle = {
    background: "var(--bg-surface)",
    borderColor: "var(--border-color-strong)"
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Portfolio Holdings</h1>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Track your mutual fund investments with live NAV.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search fund..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 outline-none w-72 focus:border-blue-500"
              style={inputStyle}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-lg px-4 py-2"
              style={inputStyle}
            >
              <option>All</option>
              <option>Equity</option>
              <option>Debt</option>
              <option>Liquid</option>
              <option>Hybrid</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-4 py-2"
              style={inputStyle}
            >
              <option value="currentValue">Current Value</option>
              <option value="invested">Invested</option>
              <option value="profit">Profit</option>
              <option value="returnPercent">Return %</option>
            </select>

            <button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              className="bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2"
            >
              {sortOrder === "desc" ? "↓ Desc" : "↑ Asc"}
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-color)"
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px]">
              <thead
                className="sticky top-0 z-10"
                style={{ background: "var(--bg-surface-2)" }}
              >
                <tr
                  className="text-sm uppercase tracking-wide"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <th className="text-left px-6 py-4">Fund</th>
                  <th className="text-right px-6 py-4">Invested</th>
                  <th className="text-right px-6 py-4">Units</th>
                  <th className="text-right px-6 py-4">Avg Buy NAV</th>
                  <th className="text-right px-6 py-4">Current NAV</th>
                  <th className="text-center px-6 py-4">NAV Date</th>
                  <th className="text-right px-6 py-4">Current Value</th>
                  <th className="text-right px-6 py-4">Profit / Loss</th>
                  <th className="text-center px-6 py-4">Return %</th>
                </tr>
              </thead>

              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-t"
                        style={{ borderColor: "var(--border-color)" }}
                      >
                        {Array.from({ length: 9 }).map((__, i) => (
                          <td key={i} className="px-6 py-5">
                            <div
                              className="h-5 rounded animate-pulse"
                              style={{ background: "var(--bg-surface-2)" }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filteredHoldings.map((item) => (
                      <tr
                        key={item.schemeCode}
                        onClick={() => navigate(`/fund/${item.schemeCode}`)}
                        className="border-t hover:opacity-80 transition-all cursor-pointer"
                        style={{ borderColor: "var(--border-color)" }}
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold">{item.fundName}</div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {item.category}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right">
                          {formatCurrency(item.invested)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          {item.units.toFixed(3)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          ₹{item.averageBuyNav?.toFixed(2)}
                        </td>

                        <td className="px-6 py-5 text-right font-semibold text-cyan-400">
                          ₹{item.currentNav?.toFixed(2)}
                        </td>

                        <td
                          className="px-6 py-5 text-center text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.navDate || "--"}
                        </td>

                        <td className="px-6 py-5 text-right font-semibold">
                          {formatCurrency(item.currentValue)}
                        </td>

                        <td
                          className={`px-6 py-5 text-right font-semibold ${
                            item.profit >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatCurrency(item.profit)}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${
                              item.returnPercent >= 0
                                ? "bg-green-500/15 text-green-400"
                                : "bg-red-500/15 text-red-400"
                            }`}
                          >
                            {item.returnPercent >= 0 ? "+" : ""}
                            {item.returnPercent.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}

                {!loading && filteredHoldings.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-20 text-center">
                      <div className="text-6xl">📂</div>
                      <h2 className="mt-5 text-2xl font-bold">
                        No Holdings Found
                      </h2>
                      <p
                        className="mt-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Try changing search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

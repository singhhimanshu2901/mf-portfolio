import { useEffect, useRef, useState } from "react";

import Sidebar from "../components/Sidebar";
import { loadFunds, searchFunds } from "../services/navService";
import { getNavOnDate } from "../services/navHistoryService";
import { saveInvestment } from "../services/portfolioService";
import { getCurrentUser } from "../services/authService";

export default function AddInvestment() {
  const [funds, setFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selectedFund, setSelectedFund] = useState(null);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("SIP");
  const [saving, setSaving] = useState(false);

  // Debounce handle for live search
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    loadFundList();

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const loadFundList = async () => {
    try {
      const data = await loadFunds();
      setFunds(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================
  // Fund search hits the live mfapi.in database (the full, real AMFI
  // universe of ~37,000+ schemes) instead of only matching against a
  // small local funds.json file. Debounced (350ms). Falls back to the
  // local funds.json list if the live search fails.
  // ======================================

  const handleFundSearch = (value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value || value.trim().length < 2) {
      setFilteredFunds([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      const liveResults = await searchFunds(value);

      if (liveResults === null) {
        const results = funds.filter((fund) =>
          fund.schemeName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredFunds(results.slice(0, 15));
      } else {
        setFilteredFunds(liveResults.slice(0, 15));
      }

      setSearching(false);
    }, 350);
  };

  const handleFundSelect = (fund) => {
    setSelectedFund(fund);
    setFilteredFunds([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = getCurrentUser();

      if (!user) {
        alert("Please Login First");
        return;
      }

      if (!selectedFund) {
        alert("Please Select Fund");
        return;
      }

      if (!date) {
        alert("Please select an investment date");
        return;
      }

      setSaving(true);

      // ======================================
      // BUG FIX: previously always called getNav(schemeCode) here, which
      // only ever returns TODAY's NAV — so backfilling an old investment
      // silently recorded today's price as the purchase price, no matter
      // what date was selected. We now look up the actual NAV as of the
      // selected date (or the nearest earlier trading day) so cost basis,
      // profit/loss, returns and XIRR are all calculated correctly.
      // ======================================

      const navOnDate = await getNavOnDate(selectedFund.schemeCode, date);

      if (!navOnDate || !navOnDate.nav) {
        alert(
          "Could not find a NAV for this fund on the selected date. Please check the date and try again."
        );
        return;
      }

      const nav = navOnDate.nav;
      const units = Number(amount) / nav;

      await saveInvestment({
        uid: user.uid,
        fundName: selectedFund.schemeName,
        schemeCode: selectedFund.schemeCode,
        category: selectedFund.category,
        amount: Number(amount),
        purchaseNav: nav,
        units,
        type,
        date
      });

      alert(
        `Investment Saved Successfully (NAV used: Rs. ${nav.toFixed(4)} as of ${navOnDate.date})`
      );

      setSelectedFund(null);
      setAmount("");
      setDate("");
    } catch (error) {
      console.error(error);
      alert("Error Saving Investment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">Add Investment</h1>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl p-6 rounded-xl"
          style={{ background: "var(--bg-surface)" }}
        >
          <div className="mb-4">
            <label>Investment Type</label>

            <select
              className="w-full p-3 mt-2 rounded"
              style={{ background: "var(--bg-surface-2)" }}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>SIP</option>
              <option>Lumpsum</option>
              <option>STP</option>
            </select>
          </div>

          <div className="mb-4 relative">
            <label>Fund Search</label>

            <input
              className="w-full p-3 mt-2 rounded"
              style={{ background: "var(--bg-surface-2)" }}
              placeholder="Search any mutual fund (e.g. HDFC, SBI, Parag Parikh...)"
              onChange={(e) => handleFundSearch(e.target.value)}
            />

            {searching && (
              <div
                className="absolute z-50 w-full rounded mt-2 p-3 text-sm"
                style={{
                  background: "var(--bg-surface-2)",
                  color: "var(--text-secondary)"
                }}
              >
                Searching...
              </div>
            )}

            {!searching && filteredFunds.length > 0 && (
              <div
                className="absolute z-50 w-full rounded mt-2 max-h-64 overflow-y-auto"
                style={{ background: "var(--bg-surface-2)" }}
              >
                {filteredFunds.map((fund) => (
                  <div
                    key={fund.schemeCode}
                    className="p-3 cursor-pointer hover:opacity-80"
                    onClick={() => handleFundSelect(fund)}
                  >
                    <div>{fund.schemeName}</div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {fund.category} · Scheme Code: {fund.schemeCode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedFund && (
            <div
              className="mb-4 p-4 rounded"
              style={{ background: "var(--bg-surface-2)" }}
            >
              <p>
                <strong>Fund:</strong> {selectedFund.schemeName}
              </p>
              <p>
                <strong>Category:</strong> {selectedFund.category}
              </p>
              <p>
                <strong>Scheme Code:</strong> {selectedFund.schemeCode}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label>Amount</label>

            <input
              type="number"
              className="w-full p-3 mt-2 rounded"
              style={{ background: "var(--bg-surface-2)" }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label>Date</label>

            <input
              type="date"
              className="w-full p-3 mt-2 rounded"
              style={{ background: "var(--bg-surface-2)" }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
            <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
              We'll use the fund's actual NAV as of this date (not today's NAV).
            </p>
          </div>

          <button
            disabled={saving}
            className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Investment"}
          </button>
        </form>
      </main>
    </div>
  );
}

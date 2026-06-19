import { useEffect, useState } from "react";

import { loadFunds, getNav } from "../services/navService";
import { saveInvestment } from "../services/portfolioService";
import { getCurrentUser } from "../services/authService";

export default function AddInvestment() {
  const [funds, setFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);

  const [selectedFund, setSelectedFund] = useState(null);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("SIP");

  useEffect(() => {
    loadFundList();
  }, []);

  const loadFundList = async () => {
    try {
      const data = await loadFunds();
      setFunds(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFundSearch = (value) => {
    if (!value) {
      setFilteredFunds([]);
      return;
    }

    const results = funds.filter((fund) =>
      fund.schemeName
        .toLowerCase()
        .includes(value.toLowerCase())
    );

    setFilteredFunds(results.slice(0, 10));
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

      const navData = await getNav(
        selectedFund.schemeCode
      );

      const nav = navData.nav;

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

        date,
      });

      alert("Investment Saved Successfully");

      setSelectedFund(null);
      setAmount("");
      setDate("");

    } catch (error) {
      console.error(error);
      alert("Error Saving Investment");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Add Investment
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl bg-slate-900 p-6 rounded-xl"
      >

        <div className="mb-4">
          <label>Investment Type</label>

          <select
            className="w-full p-3 mt-2 bg-slate-800 rounded"
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
            className="w-full p-3 mt-2 bg-slate-800 rounded"
            placeholder="Search Mutual Fund"
            onChange={(e) =>
              handleFundSearch(e.target.value)
            }
          />

          {filteredFunds.length > 0 && (

            <div className="absolute z-50 w-full bg-slate-800 rounded mt-2 max-h-64 overflow-y-auto">

              {filteredFunds.map((fund) => (

                <div
                  key={fund.schemeCode}
                  className="p-3 cursor-pointer hover:bg-slate-700"
                  onClick={() =>
                    handleFundSelect(fund)
                  }
                >
                  {fund.schemeName}
                </div>

              ))}

            </div>

          )}

        </div>

        {selectedFund && (

          <div className="mb-4 bg-slate-800 p-4 rounded">

            <p>
              <strong>Fund:</strong>{" "}
              {selectedFund.schemeName}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {selectedFund.category}
            </p>

            <p>
              <strong>Scheme Code:</strong>{" "}
              {selectedFund.schemeCode}
            </p>

          </div>

        )}

        <div className="mb-4">
          <label>Amount</label>

          <input
            type="number"
            className="w-full p-3 mt-2 bg-slate-800 rounded"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            required
          />
        </div>

        <div className="mb-6">
          <label>Date</label>

          <input
            type="date"
            className="w-full p-3 mt-2 bg-slate-800 rounded"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            required
          />
        </div>

        <button
          className="bg-blue-600 px-6 py-3 rounded"
        >
          Save Investment
        </button>

      </form>

    </div>
  );
}
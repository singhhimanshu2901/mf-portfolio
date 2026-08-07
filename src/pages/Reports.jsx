import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { imageToBase64 } from "../utils/imageToBase64";
import Sidebar from "../components/Sidebar";
import ReportCharts from "../components/reports/ReportCharts";
import FundReportChart from "../components/reports/FundReportChart";

const logo = "/logo.png";
import {
  getPortfolioHoldings,
  getInvestments,
  getFundTransactions,
  computeSummaryFromHoldings
} from "../services/portfolioService";

import { getCurrentUser, waitForAuth } from "../services/authService";

import { calculatePortfolioFDValue } from "../services/fdService";

import { getPortfolioHistory } from "../services/portfolioHistoryService";

import { getNavHistory } from "../services/navHistoryService";

import { generatePortfolioPDF } from "../utils/report/reportGenerator";
import { generateFundReportPDF } from "../utils/report/fundReportGenerator";

export default function Reports() {
  // ==============================
  // Portfolio Data
  // ==============================

  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [history, setHistory] = useState([]);
  const [fdValue, setFdValue] = useState(0);

  // ==============================
  // UI State
  // ==============================

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // ==============================
  // Chart Images
  // ==============================

  const [growthChartImage, setGrowthChartImage] = useState(null);
  const [allocationChartImage, setAllocationChartImage] = useState(null);

  // ==============================
  // Individual Fund Report State
  // ==============================

  const [selectedSchemeCode, setSelectedSchemeCode] = useState("");
  const [generatingFundReport, setGeneratingFundReport] = useState(false);
  const [fundChartHistory, setFundChartHistory] = useState([]);

  // ==============================
  // Initial Load
  // ==============================

  useEffect(() => {
    loadReport();
  }, []);

  // ==============================
  // Load Portfolio Report
  // ==============================

  const loadReport = async () => {
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

      // ==============================
      // Load Everything Together
      // ==============================
      // BUG FIX (values mismatch across report pages):
      // We no longer fetch `getPortfolioSummary()` from Firestore here.
      // That doc is a cache that's only rewritten when a new investment is
      // saved, so its currentValue can silently drift from live NAVs.
      // Instead we fetch holdings (which always uses live NAVs) and derive
      // the summary directly from that SAME array with
      // computeSummaryFromHoldings(). This guarantees the Executive
      // Summary page and the Holdings page in the PDF always show the
      // exact same total — there's no longer a second, independently
      // updated source of truth to drift out of sync.

      const [holdingsData, transactionData, portfolioHistory] =
        await Promise.all([
          getPortfolioHoldings(user.uid),
          getInvestments(user.uid),
          getPortfolioHistory(user.uid)
        ]);

      const summaryData = computeSummaryFromHoldings(holdingsData);

      // ==============================
      // Sort Holdings
      // ==============================

      const sortedHoldings = [...holdingsData].sort(
        (a, b) => b.currentValue - a.currentValue
      );

      // ==============================
      // FD Comparison
      // ==============================

      const fdRate = Number(localStorage.getItem("fdRate") || 7);
      const fdAmount = calculatePortfolioFDValue(transactionData, fdRate);

      // ==============================
      // Update State
      // ==============================

      setSummary(summaryData);
      setHoldings(sortedHoldings);
      setTransactions(transactionData);
      setHistory(portfolioHistory);
      setFdValue(fdAmount);

      if (sortedHoldings.length && !selectedSchemeCode) {
        setSelectedSchemeCode(sortedHoldings[0].schemeCode);
      }
    } catch (error) {
      console.error("Reports Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Generate Portfolio PDF
  // ==============================

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);

      // Wait for hidden charts to render
      await new Promise((resolve) => setTimeout(resolve, 400));

      // ==============================
      // Growth Chart
      // ==============================

      const logoBase64 = await imageToBase64(logo);

      const growthElement = document.getElementById("portfolio-growth-chart");
      let growthImage = null;

      if (growthElement) {
        const canvas = await html2canvas(growthElement, {
          scale: 3,
          backgroundColor: "#ffffff",
          useCORS: true
        });

        growthImage = canvas.toDataURL("image/png");
        setGrowthChartImage(growthImage);
      }

      // ==============================
      // Allocation Chart
      // ==============================

      const allocationElement = document.getElementById("allocation-chart");
      let allocationImage = null;

      if (allocationElement) {
        const canvas = await html2canvas(allocationElement, {
          scale: 3,
          backgroundColor: "#ffffff",
          useCORS: true
        });

        allocationImage = canvas.toDataURL("image/png");
        setAllocationChartImage(allocationImage);
      }

      // ==============================
      // Generate PDF
      // ==============================

      await generatePortfolioPDF({
        logo: logoBase64,
        summary,
        holdings,
        transactions,
        history,
        fdValue,
        growthChartImage: growthImage,
        allocationChartImage: allocationImage
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  // ==============================
  // Generate Individual Fund PDF
  // ==============================
  // FIX: this card previously just showed "Coming Soon" with no way to
  // actually generate anything. It now lets the user pick any fund they
  // hold, fetches that fund's own transactions + NAV history, renders a
  // hidden NAV chart for it, captures it the same way the portfolio charts
  // are captured, and builds a full per-fund PDF.

  const handleGenerateFundPDF = async () => {
    if (!selectedSchemeCode) {
      alert("Please select a fund first.");
      return;
    }

    try {
      setGeneratingFundReport(true);

      let user = getCurrentUser();
      if (!user) {
        user = await waitForAuth();
      }
      if (!user) {
        alert("Please Login First");
        return;
      }

      const holding = holdings.find(
        (item) => String(item.schemeCode) === String(selectedSchemeCode)
      );

      if (!holding) {
        alert("Selected fund could not be found in your holdings.");
        return;
      }

      const [fundTransactions, navHistory] = await Promise.all([
        getFundTransactions(user.uid, selectedSchemeCode),
        getNavHistory(selectedSchemeCode)
      ]);

      // Feed the hidden chart component and give it a moment to render
      // before we capture it.
      setFundChartHistory(navHistory || []);
      await new Promise((resolve) => setTimeout(resolve, 400));

      const chartElement = document.getElementById("fund-nav-report-chart");
      let navChartImage = null;

      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          scale: 3,
          backgroundColor: "#ffffff",
          useCORS: true
        });

        navChartImage = canvas.toDataURL("image/png");
      }

      await generateFundReportPDF({
        holding,
        transactions: fundTransactions,
        navChartImage
      });
    } catch (error) {
      console.error("Fund PDF Generation Error:", error);
      alert("Failed to generate fund report.");
    } finally {
      setGeneratingFundReport(false);
    }
  };

  // ==============================
  // Loading
  // ==============================

  if (loading || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}></div>
          <p className="mt-5 text-lg" style={{ color: "var(--text-secondary)" }}>
            Loading Portfolio Reports...
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl">Reports Center</h1>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Download beautiful professional portfolio reports.
          </p>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Portfolio */}
          <div className="rounded-2xl border p-8" style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
            <div className="text-5xl">📄</div>
            <h2 className="font-display text-2xl mt-5">Portfolio Report</h2>
            <p className="mt-4 leading-7" style={{ color: "var(--text-secondary)" }}>
              Complete PDF report including Executive Summary, Portfolio
              Growth, Asset Allocation, Holdings, MF vs FD Comparison,
              Portfolio Health & Smart Insights.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex justify-between">
                <span>Total Funds</span>
                <span className="font-mono">{holdings.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Invested</span>
                <span className="font-mono">
                  ₹
                  {summary.totalInvested.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Value</span>
                <span className="font-mono" style={{ color: "var(--gain)" }}>
                  ₹
                  {summary.currentValue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Return</span>
                <span
                  className="font-mono"
                  style={{ color: summary.returnPercent >= 0 ? "var(--gain)" : "var(--loss)" }}
                >
                  {summary.returnPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="mt-10 w-full rounded-xl disabled:opacity-60 py-4 font-semibold transition-colors"
              style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            >
              {generating ? "Generating Report..." : "Generate Portfolio PDF"}
            </button>
          </div>

          {/* Fund */}
          <div className="rounded-2xl border p-8" style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
            <div className="text-5xl">📑</div>
            <h2 className="font-display text-2xl mt-5">Individual Fund Report</h2>
            <p className="mt-4 leading-7" style={{ color: "var(--text-secondary)" }}>
              Generate detailed reports for every mutual fund. Includes NAV
              history, investment analytics, XIRR, Wealth Multiplier,
              Transactions, Performance Statistics and Growth Analysis.
            </p>

            {holdings.length === 0 ? (
              <div className="mt-10 rounded-xl p-8 text-center" style={{ background: "var(--bg-surface-2)" }}>
                <div className="text-4xl">📭</div>
                <h3 className="mt-4 font-display text-xl">No Funds Yet</h3>
                <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
                  Add an investment to generate a fund report.
                </p>
              </div>
            ) : (
              <div className="mt-8">
                <label className="text-sm" style={{ color: "var(--text-secondary)" }}>Select Fund</label>

                <select
                  className="w-full p-3 mt-2 rounded" style={{ background: "var(--bg-surface-2)" }}
                  value={selectedSchemeCode}
                  onChange={(e) => setSelectedSchemeCode(e.target.value)}
                >
                  {holdings.map((holding) => (
                    <option key={holding.schemeCode} value={holding.schemeCode}>
                      {holding.fundName}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleGenerateFundPDF}
                  disabled={generatingFundReport}
                  className="mt-6 w-full rounded-xl disabled:opacity-60 py-4 font-semibold transition-colors"
                  style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                >
                  {generatingFundReport
                    ? "Generating Report..."
                    : "Generate Fund PDF"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Charts */}
        <div
          className="fixed"
          style={{
            left: "-10000px",
            top: 0,
            width: 900,
            opacity: 1
          }}
        >
          <ReportCharts history={history} summary={summary} />
          <FundReportChart history={fundChartHistory} />
        </div>
      </main>
    </div>
  );
}

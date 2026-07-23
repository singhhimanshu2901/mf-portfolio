import autoTable from "jspdf-autotable";
import { formatCurrency, formatPercent, safeNumber } from "../format";

// ======================================
// Holdings Page
// ======================================
// `summary` is now an accepted (optional) param. Previously this page
// re-derived "Current Portfolio Value" by summing fund.currentValue across
// holdings, which produced a different number than the Executive Summary's
// summary.currentValue whenever the two data sources drift apart (e.g.
// stale NAV on one fund, a manual adjustment entry, rounding differences).
// We now display summary.currentValue when it's available so the number
// the user sees is IDENTICAL across every page of the report. The
// per-fund sum is still used internally for the Top-5 contribution % since
// that ratio only makes sense relative to the holdings themselves.

export const holdingsPage = (
  doc,
  {
    holdings,
    summary
  }
) => {
  // ======================================
  // Title
  // ======================================

  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text("Portfolio Holdings", 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(110, 110, 110);
  doc.text("Detailed analysis of every mutual fund in your portfolio.", 14, 26);

  // ======================================
  // Sort By Current Value
  // ======================================

  const sorted = [...holdings].sort(
    (a, b) => safeNumber(b.currentValue) - safeNumber(a.currentValue)
  );

  // ======================================
  // Table
  // ======================================

  autoTable(doc, {
    startY: 38,
    theme: "grid",
    head: [["Rank", "Fund", "Invested", "Current", "P/L", "Return", "XIRR"]],
    body: sorted.map((fund, index) => [
      index + 1,
      fund.fundName,
      formatCurrency(fund.invested),
      formatCurrency(fund.currentValue),
      formatCurrency(fund.profit),
      formatPercent(fund.returnPercent),
      formatPercent(fund.xirr)
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2, valign: "middle" },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.index === 4) {
        const value = safeNumber(sorted[data.row.index].profit);
        data.cell.styles.textColor = value >= 0 ? [22, 163, 74] : [220, 38, 38];
      }
      if (data.section === "body" && data.column.index === 5) {
        const value = safeNumber(sorted[data.row.index].returnPercent);
        data.cell.styles.textColor = value >= 0 ? [22, 163, 74] : [220, 38, 38];
      }
    }
  });

  // ======================================
  // Best / Worst Holding
  // ======================================

  const bestFund = [...sorted].sort(
    (a, b) => safeNumber(b.returnPercent) - safeNumber(a.returnPercent)
  )[0];

  const worstFund = [...sorted].sort(
    (a, b) => safeNumber(a.returnPercent) - safeNumber(b.returnPercent)
  )[0];

  const holdingsSumValue = sorted.reduce(
    (sum, fund) => sum + safeNumber(fund.currentValue),
    0
  );

  // Use the canonical summary.currentValue for display when available so
  // this page always agrees with the Executive Summary page. Fall back to
  // the per-fund sum only if summary wasn't passed in.
  const totalValue = summary ? safeNumber(summary.currentValue) : holdingsSumValue;

  const infoY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text("Holdings Overview", 14, infoY);

  // ======================================
  // Best Performer Card
  // ======================================

  doc.setFillColor(22, 163, 74);
  doc.roundedRect(14, infoY + 8, 88, 28, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("Best Performer", 18, infoY + 17);
  doc.setFontSize(9);
  doc.text(bestFund?.fundName || "--", 18, infoY + 25);
  doc.text(`${formatPercent(safeNumber(bestFund?.returnPercent))} Return`, 18, infoY + 32);

  // ======================================
  // Worst Performer Card
  // ======================================

  doc.setFillColor(220, 38, 38);
  doc.roundedRect(108, infoY + 8, 88, 28, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("Needs Attention", 112, infoY + 17);
  doc.setFontSize(9);
  doc.text(worstFund?.fundName || "--", 112, infoY + 25);
  doc.text(`${formatPercent(safeNumber(worstFund?.returnPercent))} Return`, 112, infoY + 32);

  // ======================================
  // Portfolio Holdings Summary
  // ======================================

  const summaryY = infoY + 48;

  const averageReturn = sorted.length
    ? sorted.reduce((sum, fund) => sum + safeNumber(fund.returnPercent), 0) / sorted.length
    : 0;

  const top5Value = sorted
    .slice(0, 5)
    .reduce((sum, fund) => sum + safeNumber(fund.currentValue), 0);

  // Top-5 contribution is a ratio *within* the holdings list, so it should
  // stay based on the holdings-derived sum even though the displayed
  // "Current Portfolio Value" row now uses summary.currentValue.
  const top5Contribution = holdingsSumValue > 0 ? (top5Value / holdingsSumValue) * 100 : 0;

  autoTable(doc, {
    startY: summaryY,
    theme: "grid",
    head: [["Portfolio Metric", "Value"]],
    body: [
      ["Total Holdings", sorted.length],
      ["Current Portfolio Value", formatCurrency(totalValue)],
      ["Average Return", formatPercent(averageReturn)],
      ["Top 5 Contribution", formatPercent(top5Contribution)],
      ["Best Performer", bestFund?.fundName || "--"],
      ["Worst Performer", worstFund?.fundName || "--"]
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    styles: { fontSize: 9 }
  });

  // ======================================
  // Holdings Insight
  // ======================================

  let insight = "";

  if (top5Contribution >= 75) {
    insight = "Your portfolio is highly concentrated. Consider diversifying into additional quality funds.";
  } else if (top5Contribution >= 55) {
    insight = "Your portfolio has a balanced allocation with moderate concentration.";
  } else {
    insight = "Excellent diversification across multiple mutual funds.";
  }

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Holdings Insight", 14, doc.lastAutoTable.finalY + 16);

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  const lines = doc.splitTextToSize(insight, 182);
  doc.text(lines, 14, doc.lastAutoTable.finalY + 26);

  // ======================================
  // Footer Note
  // ======================================

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "Holdings are ranked by current market value. Performance metrics are based on the latest available NAV.",
    14,
    285
  );

  // ======================================
  // Next Page
  // ======================================

  doc.addPage();
};

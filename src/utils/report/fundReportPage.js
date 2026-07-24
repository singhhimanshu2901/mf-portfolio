import autoTable from "jspdf-autotable";
import { formatCurrency, formatPercent, formatNumber, safeNumber } from "../format";

// ======================================
// Individual Fund Report Page
// ======================================

export const fundReportPage = (
  doc,
  {
    holding,
    transactions,
    navChartImage
  }
) => {
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const FOOTER_LIMIT = PAGE_HEIGHT - 20;

  const ensureSpace = (y, neededHeight) => {
    if (y + neededHeight > FOOTER_LIMIT) {
      doc.addPage();
      return 20;
    }
    return y;
  };

  // ======================================
  // Title
  // ======================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text(holding.fundName || "Fund Report", 14, 18, { maxWidth: 182 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text(`${holding.category || "--"} · Scheme Code: ${holding.schemeCode || "--"}`, 14, 26);

  // ======================================
  // KPI Cards (Row 1)
  // ======================================

  const drawCard = (x, y, title, value, color) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, 42, 24, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title, x + 3, y + 8);

    doc.setFontSize(11);
    doc.text(value, x + 3, y + 17);
  };

  drawCard(14, 36, "Invested", formatCurrency(holding.invested), [37, 99, 235]);
  drawCard(60, 36, "Current Value", formatCurrency(holding.currentValue), [22, 163, 74]);
  drawCard(
    106,
    36,
    "Profit / Loss",
    formatCurrency(holding.profit),
    safeNumber(holding.profit) >= 0 ? [22, 163, 74] : [220, 38, 38]
  );
  drawCard(152, 36, "Return", formatPercent(holding.returnPercent), [245, 158, 11]);

  // ======================================
  // KPI Cards (Row 2)
  // ======================================

  drawCard(14, 64, "XIRR", formatPercent(holding.xirr), [99, 102, 241]);
  drawCard(60, 64, "Current NAV", `Rs. ${formatNumber(holding.currentNav)}`, [37, 99, 235]);
  drawCard(106, 64, "Avg Buy NAV", `Rs. ${formatNumber(holding.averageBuyNav)}`, [22, 163, 74]);
  drawCard(
    152,
    64,
    "Wealth Multiplier",
    `${formatNumber(holding.wealthMultiplier)}x`,
    [245, 158, 11]
  );

  // ======================================
  // Details Table
  // ======================================

  autoTable(doc, {
    startY: 96,
    theme: "grid",
    head: [["Detail", "Value"]],
    body: [
      ["Units Held", formatNumber(holding.units, 3)],
      ["Investment Age", holding.investmentAge || "--"],
      ["First Investment", holding.firstInvestmentDate || "--"],
      ["Last Investment", holding.lastInvestmentDate || "--"],
      ["Total Transactions", String(holding.transactionCount ?? transactions.length)],
      ["NAV Date", holding.navDate || "--"]
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [247, 248, 250] }
  });

  // ======================================
  // NAV Trend Chart
  // ======================================

  let chartY = doc.lastAutoTable.finalY + 14;
  chartY = ensureSpace(chartY, 100);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text("NAV Trend", 14, chartY);

  if (navChartImage) {
    doc.addImage(navChartImage, "PNG", 14, chartY + 6, 182, 82);
  } else {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(14, chartY + 6, 182, 82, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("NAV history chart not available.", 105, chartY + 6 + 41, { align: "center" });
  }

  let currentY = chartY + 95;

  // ======================================
  // Transaction History
  // ======================================

  currentY = ensureSpace(currentY, 40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text("Transaction History", 14, currentY);

  let runningUnits = 0;
  let runningCost = 0;

  const sortedTxns = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const rows = sortedTxns.map((txn) => {
    const units = safeNumber(txn.units);
    const amount = safeNumber(txn.amount);
    const buyNav = safeNumber(txn.purchaseNav);

    runningUnits += units;
    runningCost += amount;

    const currentValue = units * safeNumber(holding.currentNav);
    const gain = currentValue - amount;
    const gainPercent = amount > 0 ? (gain / amount) * 100 : 0;

    return [
      txn.date || "--",
      txn.type || "--",
      formatCurrency(amount),
      `Rs. ${formatNumber(buyNav)}`,
      formatNumber(units, 3),
      formatCurrency(currentValue),
      formatCurrency(gain),
      formatPercent(gainPercent)
    ];
  });

  autoTable(doc, {
    startY: currentY + 8,
    theme: "grid",
    head: [
      [
        "Date",
        "Type",
        "Amount",
        "Buy NAV",
        "Units",
        "Current Value",
        "Gain",
        "Return %"
      ]
    ],
    body: rows.length
      ? rows
      : [["--", "--", "--", "--", "--", "--", "--", "--"]],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.index === 6 && rows[data.row.index]) {
        const gainText = rows[data.row.index][6];
        const isNegative = gainText.includes("-");
        data.cell.styles.textColor = isNegative ? [220, 38, 38] : [22, 163, 74];
      }
    }
  });

  // ======================================
  // Insight
  // ======================================

  let insightY = doc.lastAutoTable.finalY + 12;
  insightY = ensureSpace(insightY, 40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text("Fund Insight", 14, insightY);

  let insight = "";

  if (safeNumber(holding.returnPercent) >= 20) {
    insight =
      "This fund has delivered excellent returns and has been a strong contributor to your portfolio.";
  } else if (safeNumber(holding.returnPercent) >= 10) {
    insight = "This fund is performing well and is above typical long-term market averages.";
  } else if (safeNumber(holding.returnPercent) >= 0) {
    insight =
      "This fund is currently profitable, though returns are moderate. Continue monitoring its performance.";
  } else {
    insight =
      "This fund is currently below your invested amount. Market fluctuations are normal — review before making any changes.";
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  const lines = doc.splitTextToSize(insight, 182);
  doc.text(lines, 14, insightY + 10);

  // ======================================
  // Footer Note
  // ======================================

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "This report is generated using your transaction history and the latest available NAV. For informational purposes only.",
    14,
    285
  );
};

import autoTable from "jspdf-autotable";

// ======================================
// Executive Summary
// ======================================

export const summaryPage = (
  doc,
  {
    summary,
    portfolioScore,
    wealthMultiplier,
    totalFunds,
    allocationChartImage
  }
) => {
  // ======================================
  // Helpers
  // ======================================
  // ₹ -> "Rs." : jsPDF's built-in fonts (Helvetica etc.) don't contain the
  // Unicode Rupee glyph, so it silently renders as a stray "¹" character.
  // "Rs." works with every standard PDF font with no extra setup.

  const formatCurrency = (value = 0) =>
    `Rs. ${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const formatPercent = (value = 0) => `${Number(value).toFixed(2)}%`;

  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const FOOTER_LIMIT = PAGE_HEIGHT - 20;

  // Adds a new page and resets the running Y cursor whenever the next
  // block wouldn't fit above the footer line. Call this BEFORE drawing a
  // new section, passing how tall (roughly) that section will be.
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
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text("Executive Summary", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text("Overall portfolio performance at a glance.", 14, 26);

  // ======================================
  // KPI Cards
  // ======================================

  const drawCard = (x, y, title, value, color) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, 42, 24, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title, x + 3, y + 7);

    doc.setFontSize(13);
    doc.text(value, x + 3, y + 17);
  };

  drawCard(14, 38, "Invested", formatCurrency(summary.totalInvested), [37, 99, 235]);
  drawCard(60, 38, "Current", formatCurrency(summary.currentValue), [22, 163, 74]);
  drawCard(106, 38, "Return", formatPercent(summary.returnPercent), [245, 158, 11]);
  drawCard(152, 38, "Score", `${portfolioScore}/100`, [99, 102, 241]);

  // ======================================
  // Summary Table
  // ======================================

  autoTable(doc, {
    startY: 72,
    theme: "grid",
    head: [["Metric", "Value"]],
    body: [
      ["Total Invested", formatCurrency(summary.totalInvested)],
      ["Current Value", formatCurrency(summary.currentValue)],
      ["Profit / Loss", formatCurrency(summary.profitLoss)],
      ["Absolute Return", formatPercent(summary.returnPercent)],
      ["Portfolio Score", `${portfolioScore}/100`],
      ["Total Funds", String(totalFunds)],
      ["Equity Allocation", formatPercent(summary.equityPercent)],
      ["Debt Allocation", formatPercent(summary.debtPercent)],
      ["Liquid Allocation", formatPercent(summary.liquidPercent)],
      ["Wealth Multiplier", `${Number(wealthMultiplier).toFixed(2)}x`]
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [247, 248, 250] }
  });

  // ======================================
  // Performance Badge
  // ======================================

  let badgeColor = [22, 163, 74];
  let badgeText = "Excellent";

  if (portfolioScore < 90) {
    badgeColor = [59, 130, 246];
    badgeText = "Very Good";
  }
  if (portfolioScore < 75) {
    badgeColor = [245, 158, 11];
    badgeText = "Good";
  }
  if (portfolioScore < 60) {
    badgeColor = [249, 115, 22];
    badgeText = "Average";
  }
  if (portfolioScore < 45) {
    badgeColor = [239, 68, 68];
    badgeText = "Needs Improvement";
  }

  const tableEnd = doc.lastAutoTable.finalY + 8;

  doc.setFillColor(...badgeColor);
  doc.roundedRect(14, tableEnd, 182, 18, 5, 5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`Overall Portfolio Rating : ${badgeText}`, 20, tableEnd + 12);

  // ======================================
  // Allocation Chart
  // ======================================

  let currentY = tableEnd + 28;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text("Asset Allocation", 14, currentY);

  currentY += 6;

  if (allocationChartImage) {
    try {
      doc.addImage(allocationChartImage, "PNG", 20, currentY, 70, 70);
    } catch (err) {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Unable to render allocation chart.", 20, currentY + 20);
    }
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Allocation chart not available.", 20, currentY + 20);
  }

  // ======================================
  // Allocation Details
  // ======================================

  autoTable(doc, {
    startY: currentY,
    margin: { left: 105 },
    tableWidth: 90,
    head: [["Asset", "Weight"]],
    body: [
      ["Equity", formatPercent(summary.equityPercent)],
      ["Debt", formatPercent(summary.debtPercent)],
      ["Liquid", formatPercent(summary.liquidPercent)]
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  });

  currentY = Math.max(doc.lastAutoTable.finalY, currentY + 72) + 10;

  // ======================================
  // Portfolio Highlights
  // ======================================
  // Page-overflow guard: this block's height depends on the number of
  // highlight rows (fixed at 7 here, roughly 8mm per row via autoTable +
  // heading), so we check space before drawing it instead of assuming it
  // always fits on the current page.

  currentY = ensureSpace(currentY, 80);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text("Portfolio Highlights", 14, currentY);

  currentY += 8;

  const highlights = [
    { title: "Current Portfolio Value", value: formatCurrency(summary.currentValue) },
    { title: "Total Investment", value: formatCurrency(summary.totalInvested) },
    { title: "Net Profit / Loss", value: formatCurrency(summary.profitLoss) },
    { title: "Absolute Return", value: formatPercent(summary.returnPercent) },
    { title: "Portfolio Score", value: `${portfolioScore}/100` },
    { title: "Mutual Funds", value: `${totalFunds}` },
    { title: "Wealth Multiplier", value: `${Number(wealthMultiplier).toFixed(2)}x` }
  ];

  autoTable(doc, {
    startY: currentY,
    theme: "plain",
    body: highlights.map((item) => [item.title, item.value]),
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineWidth: 0.2,
      lineColor: [220, 220, 220]
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 85 },
      1: { halign: "right" }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // ======================================
  // Portfolio Insights
  // ======================================

  const insights = [];

  if (summary.returnPercent >= 20) {
    insights.push(
      "\u2022 Your portfolio has delivered outstanding returns over the selected period."
    );
  } else if (summary.returnPercent >= 12) {
    insights.push(
      "\u2022 Portfolio performance is healthy and above long-term market averages."
    );
  } else if (summary.returnPercent >= 0) {
    insights.push(
      "\u2022 Portfolio is generating positive returns with scope for further optimization."
    );
  } else {
    insights.push(
      "\u2022 Portfolio is currently in negative territory and requires review."
    );
  }

  if (summary.equityPercent > 80) {
    insights.push(
      "\u2022 High equity exposure may increase long-term growth as well as volatility."
    );
  }

  if (summary.debtPercent > 40) {
    insights.push(
      "\u2022 Debt allocation provides stability during market fluctuations."
    );
  }

  if (summary.liquidPercent > 20) {
    insights.push(
      "\u2022 Liquid allocation improves emergency liquidity but may reduce long-term growth."
    );
  }

  insights.push(
    `\u2022 Portfolio diversification includes ${totalFunds} mutual fund${totalFunds > 1 ? "s" : ""}.`
  );

  // Page-overflow guard before the heading + variable-length bullet list.
  const estimatedInsightsHeight = 8 + insights.length * 10;
  currentY = ensureSpace(currentY, estimatedInsightsHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59);
  doc.text("Quick Insights", 14, currentY);

  currentY += 8;

  insights.forEach((text) => {
    const lines = doc.splitTextToSize(text, 175);
    const blockHeight = lines.length * 5 + 3;

    // Guard again per-bullet in case a long list runs past the footer.
    currentY = ensureSpace(currentY, blockHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70);
    doc.text(lines, 18, currentY);

    currentY += blockHeight;
  });

  // ======================================
  // End Summary Page
  // ======================================
  // BUG FIX: this page previously never called doc.addPage(), so the next
  // page (Portfolio Growth) started drawing on top of whatever was left of
  // this page instead of on a fresh page.

  doc.addPage();
};

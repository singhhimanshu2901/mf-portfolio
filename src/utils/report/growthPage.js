import autoTable from "jspdf-autotable";
import { formatCurrency, formatPercent, safeNumber } from "../format";

// ======================================
// Portfolio Growth Page
// ======================================

export const growthPage = (
  doc,
  {
    summary,
    holdings,
    portfolioHistory,
    growthChartImage,
    xirr,
    cagr
  }
) => {
  // ======================================
  // Title
  // ======================================

  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text("Portfolio Growth", 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(110, 110, 110);
  doc.text("Historical portfolio growth and performance analysis.", 14, 26);

  // ======================================
  // Calculations
  // ======================================

  const invested = safeNumber(summary.totalInvested);
  const current = safeNumber(summary.currentValue);
  const gain = current - invested;
  const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;

  // ROOT CAUSE of the "NaN" bug (confirmed from portfolioHistoryService.js):
  // history items actually have the shape
  // { date, invested, portfolio, profit, returnPercent } — there is no
  // `.value` field at all. `Math.max(...history.map(i => i.value))` was
  // therefore always `Math.max(undefined, undefined, ...)` = NaN.
  // `.portfolio` is the correct field; the other keys are kept only as a
  // defensive fallback in case this function is ever reused with a
  // differently-shaped history array elsewhere in the app.
  const getHistoryValue = (item) => {
    const raw = item?.portfolio ?? item?.value ?? item?.amount ?? item?.portfolioValue;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  };

  const validHistoryValues = (portfolioHistory || [])
    .map(getHistoryValue)
    .filter((v) => v !== null);

  const highestValue = validHistoryValues.length
    ? Math.max(...validHistoryValues)
    : current;

  const lowestValue = validHistoryValues.length
    ? Math.min(...validHistoryValues)
    : invested;

  // ======================================
  // KPI Cards
  // ======================================

  const drawCard = (x, title, value, color) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, 36, 42, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(title, x + 3, 44);
    doc.setFontSize(11);
    doc.text(value, x + 3, 53);
  };

  drawCard(14, "Current", formatCurrency(current), [37, 99, 235]);
  drawCard(60, "Gain", formatCurrency(gain), gain >= 0 ? [22, 163, 74] : [220, 38, 38]);
  drawCard(106, "Growth", formatPercent(gainPercent), [245, 158, 11]);
  drawCard(152, "XIRR", formatPercent(safeNumber(xirr)), [99, 102, 241]);

  // ======================================
  // Growth Chart
  // ======================================

  const chartY = 72;
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("Portfolio Growth Trend", 14, chartY);

  if (growthChartImage) {
    doc.addImage(growthChartImage, "PNG", 14, chartY + 6, 182, 82);
  } else {
    // Fallback so the page never renders an empty bordered box with no
    // explanation. The most common cause of a missing chart image is that
    // the chart-to-image capture (e.g. a canvas .toDataURL() call) ran
    // before the chart had finished rendering, or portfolioHistory was
    // empty when the chart was generated.
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(14, chartY + 6, 182, 82, 2, 2, "FD");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const msg = validHistoryValues.length
      ? "Growth chart image was not generated for this report."
      : "No historical data points available to plot growth trend.";
    doc.text(msg, 105, chartY + 6 + 41, { align: "center" });
  }

  // ======================================
  // Growth Statistics
  // ======================================

  autoTable(doc, {
    startY: chartY + 95,
    theme: "grid",
    head: [["Metric", "Value"]],
    body: [
      ["Current Portfolio Value", formatCurrency(current)],
      ["Highest Portfolio Value", formatCurrency(highestValue)],
      ["Lowest Portfolio Value", formatCurrency(lowestValue)],
      ["Total Gain", formatCurrency(gain)],
      ["Growth Percentage", formatPercent(gainPercent)],
      ["Portfolio CAGR", formatPercent(safeNumber(cagr))],
      ["Portfolio XIRR", formatPercent(safeNumber(xirr))],
      ["Total Holdings", holdings.length]
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [247, 248, 250] }
  });

  // ======================================
  // Performance Badge
  // ======================================

  let performance = "Average";
  let badgeColor = [245, 158, 11];

  if (gainPercent >= 20) {
    performance = "Excellent";
    badgeColor = [22, 163, 74];
  } else if (gainPercent >= 10) {
    performance = "Good";
    badgeColor = [37, 99, 235];
  }

  const badgeY = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(...badgeColor);
  doc.roundedRect(14, badgeY, 182, 15, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(`Portfolio Performance : ${performance}`, 20, badgeY + 10);

  // ======================================
  // Growth Interpretation
  // ======================================

  let message = "";

  if (gainPercent >= 20) {
    message = "Outstanding long-term portfolio growth with consistently strong performance.";
  } else if (gainPercent >= 10) {
    message = "Portfolio is generating healthy long-term returns and is outperforming most traditional investments.";
  } else if (gainPercent >= 0) {
    message = "Portfolio is profitable but there is room for improving overall returns through periodic review.";
  } else {
    message = "Portfolio is currently below invested value. Market fluctuations are normal; review your allocation before making decisions.";
  }

  doc.setTextColor(70, 70, 70);
  doc.setFontSize(10);
  doc.text("Performance Interpretation", 14, badgeY + 28);

  doc.setFontSize(9);
  const lines = doc.splitTextToSize(message, 180);
  doc.text(lines, 14, badgeY + 38);

  // ======================================
  // Timeline
  // ======================================

  const timelineY = badgeY + 62;
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Portfolio Timeline", 14, timelineY);

  if (portfolioHistory && portfolioHistory.length) {
    const firstDate = portfolioHistory[0]?.date;
    const lastDate = portfolioHistory[portfolioHistory.length - 1]?.date;

    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`From : ${firstDate || "--"}`, 18, timelineY + 12);
    doc.text(`To : ${lastDate || "--"}`, 18, timelineY + 22);
    doc.text(`Data Points : ${portfolioHistory.length}`, 18, timelineY + 32);
  } else {
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Historical portfolio timeline is currently unavailable.", 18, timelineY + 14);
  }

  // ======================================
  // Footer Note
  // ======================================

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("Growth analysis is based on historical portfolio values and current NAV data.", 14, 285);

  // ======================================
  // Next Page
  // ======================================

  doc.addPage();
};

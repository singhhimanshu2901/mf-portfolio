import jsPDF from "jspdf";

import { fundReportPage } from "./fundReportPage";
import { footer } from "./footer";

// ======================================
// Individual Fund PDF Generator
// ======================================
// This wires up the previously "Coming Soon" Individual Fund Report card
// on the Reports page. It reuses the same layout conventions (colors,
// KPI cards, autoTable styling) as the main portfolio report so the two
// PDFs feel consistent.

export const generateFundReportPDF = async ({ holding, transactions, navChartImage }) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  fundReportPage(doc, {
    holding,
    transactions,
    navChartImage
  });

  footer(doc);

  const today = new Date().toLocaleDateString("en-IN").replaceAll("/", "-");
  const safeFundName = (holding.fundName || "Fund").replace(/[^a-z0-9]+/gi, "_");

  doc.save(`${safeFundName}_Report_${today}.pdf`);
};

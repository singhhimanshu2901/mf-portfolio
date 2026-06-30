import jsPDF from "jspdf";

import { coverPage } from "./coverPage";
import { summaryPage } from "./summaryPage";
import { growthPage } from "./growthPage";
import { holdingsPage } from "./holdingsPage";
import { analysisPage } from "./analysisPage";
import { insightsPage } from "./insightsPage";
import { footer } from "./footer";

// ======================================
// Helpers
// ======================================

const calculatePortfolioScore = (

  summary,

  holdings

) => {

  let score = 50;

  if (

    summary.returnPercent >= 20

  )

    score += 20;

  else if (

    summary.returnPercent >= 15

  )

    score += 15;

  else if (

    summary.returnPercent >= 10

  )

    score += 10;

  if (

    holdings.length >= 8

  )

    score += 15;

  else if (

    holdings.length >= 5

  )

    score += 10;

  else if (

    holdings.length >= 3

  )

    score += 5;

  if (

    summary.equityPercent >= 50 &&

    summary.equityPercent <= 80

  )

    score += 10;

  if (

    summary.currentValue >

    summary.totalInvested

  )

    score += 5;

  return Math.min(

    100,

    Math.round(score)

  );

};

// ======================================

const calculateWealthMultiplier = (

  invested,

  current

) => {

  if (

    invested <= 0

  )

    return 0;

  return Number(

    (

      current /

      invested

    ).toFixed(2)

  );

};

// ======================================

const getReportPeriod = (

  transactions

) => {

  if (

    !transactions.length

  )

    return "ALL";

  const first = new Date(

    transactions[0].date

  );

  const last = new Date();

  const months =

    (

      last -

      first

    ) /

    (1000 * 60 * 60 * 24 * 30);

  if (

    months <= 1

  )

    return "1 Month";

  if (

    months <= 6

  )

    return "6 Months";

  if (

    months <= 12

  )

    return "1 Year";

  return "All Time";

};

// ======================================
// Main Generator
// ======================================

export const generatePortfolioPDF = async ({

  logo,

  summary,

  holdings,

  transactions,

  history,

  fdValue,

  growthChartImage,

  allocationChartImage

}) => {

  const doc = new jsPDF({

    orientation: "portrait",

    unit: "mm",

    format: "a4"

  });

  // ======================================

  const portfolioScore =

    calculatePortfolioScore(

      summary,

      holdings

    );

  const wealthMultiplier =

    calculateWealthMultiplier(

      summary.totalInvested,

      summary.currentValue

    );

  const reportPeriod =

    getReportPeriod(

      transactions

    );

  const userName =

    localStorage.getItem(

      "userName"

    ) ||

    "Portfolio Owner";
      // ======================================
  // Cover Page
  // ======================================

  coverPage(

    doc,

    {

      logo,

      userName,

      portfolioScore,

      reportPeriod

    }

  );

  // ======================================
  // Executive Summary
  // ======================================

  summaryPage(

    doc,

    {

      summary,

      portfolioScore,

      wealthMultiplier,

      totalFunds:

        holdings.length,

      allocationChartImage

    }

  );

  // ======================================
  // Portfolio Growth
  // ======================================

  growthPage(

    doc,

    {

      summary,

      holdings,

      portfolioHistory:

        history,

      growthChartImage,

      xirr:

        summary.xirr || 0,

      cagr:

        summary.cagr || 0

    }

  );

  // ======================================
  // Holdings
  // ======================================

  holdingsPage(

    doc,

    {

      holdings

    }

  );

  // ======================================
  // Analysis
  // ======================================

  analysisPage(

    doc,

    {

      summary,

      holdings,

      fdValue,

      portfolioScore

    }

  );

  // ======================================
  // Insights
  // ======================================

  insightsPage(

    doc,

    {

      summary,

      holdings,

      fdValue

    }

  );

  // ======================================
  // Footer
  // ======================================

  footer(

    doc

  );

  // ======================================
  // Save
  // ======================================

  const today =

    new Date()

      .toLocaleDateString(

        "en-IN"

      )

      .replaceAll(

        "/",

        "-"

      );

  doc.save(

    `Portfolio_Report_${today}.pdf`

  );

};
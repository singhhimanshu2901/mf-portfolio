import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ======================================
// Helpers
// ======================================

const formatCurrency = value =>

  `₹${Number(

    value || 0

  ).toLocaleString(

    "en-IN",

    {

      maximumFractionDigits: 0

    }

  )}`;

const formatPercent = value =>

  `${Number(

    value || 0

  ).toFixed(2)}%`;

const getToday = () =>

  new Date().toLocaleDateString(

    "en-IN"

  );

// ======================================
// Main Generator
// ======================================

export const generatePortfolioPDF = ({

  summary,

  holdings,

  transactions,

  fdValue

}) => {

  const doc = new jsPDF({

    orientation: "portrait",

    unit: "mm",

    format: "a4"

  });

  const today = getToday();

  // ======================================
  // Cover
  // ======================================

  doc.setFillColor(

    37,

    99,

    235

  );

  doc.rect(

    0,

    0,

    210,

    40,

    "F"

  );

  doc.setTextColor(

    255,

    255,

    255

  );

  doc.setFontSize(

    24

  );

  doc.text(

    "MF Portfolio Manager",

    15,

    18

  );

  doc.setFontSize(

    13

  );

  doc.text(

    "Professional Portfolio Report",

    15,

    28

  );

  doc.setFontSize(

    10

  );

  doc.text(

    `Generated : ${today}`,

    145,

    18

  );

  doc.setTextColor(

    0,

    0,

    0

  );

  // ======================================
  // Executive Summary
  // ======================================

  doc.setFontSize(

    18

  );

  doc.text(

    "Executive Summary",

    15,

    55

  );

  autoTable(

    doc,

    {

      startY: 62,

      head: [

        [

          "Metric",

          "Value"

        ]

      ],

      body: [

        [

          "Total Invested",

          formatCurrency(

            summary.totalInvested

          )

        ],

        [

          "Current Value",

          formatCurrency(

            summary.currentValue

          )

        ],

        [

          "Profit / Loss",

          formatCurrency(

            summary.profitLoss

          )

        ],

        [

          "Return",

          formatPercent(

            summary.returnPercent

          )

        ],

        [

          "Equity",

          formatCurrency(

            summary.equityValue

          )

        ],

        [

          "Debt",

          formatCurrency(

            summary.debtValue

          )

        ],

        [

          "Liquid",

          formatCurrency(

            summary.liquidValue

          )

        ]

      ],

      headStyles: {

        fillColor: [

          37,

          99,

          235

        ]

      },

      alternateRowStyles: {

        fillColor: [

          245,

          245,

          245

        ]

      },

      styles: {

        fontSize: 10

      }

    }

  );
    // ======================================
  // Holdings Summary
  // ======================================

  const bestFund =
    holdings.length
      ? holdings[0]
      : null;

  const worstFund =
    holdings.length
      ? holdings[
          holdings.length - 1
        ]
      : null;

  autoTable(

    doc,

    {

      startY:

        doc.lastAutoTable.finalY +

        12,

      head: [[

        "#",

        "Fund",

        "Invested",

        "Current",

        "Profit",

        "Return",

        "XIRR"

      ]],

      body:

        holdings.map(

          (

            fund,

            index

          ) => [

            index + 1,

            fund.fundName,

            formatCurrency(

              fund.invested

            ),

            formatCurrency(

              fund.currentValue

            ),

            formatCurrency(

              fund.profit

            ),

            formatPercent(

              fund.returnPercent

            ),

            formatPercent(

              fund.xirr

            )

          ]

        ),

      headStyles: {

        fillColor: [

          37,

          99,

          235

        ]

      },

      alternateRowStyles: {

        fillColor: [

          245,

          245,

          245

        ]

      },

      styles: {

        fontSize: 8

      }

    }

  );

  // ======================================
  // Best / Worst Fund
  // ======================================

  autoTable(

    doc,

    {

      startY:

        doc.lastAutoTable.finalY +

        12,

      head: [[

        "Fund Performance",

        "Value"

      ]],

      body: [

        [

          "Best Fund",

          bestFund?.fundName ||

          "--"

        ],

        [

          "Best Return",

          bestFund

            ? formatPercent(

                bestFund.returnPercent

              )

            : "--"

        ],

        [

          "Worst Fund",

          worstFund?.fundName ||

          "--"

        ],

        [

          "Worst Return",

          worstFund

            ? formatPercent(

                worstFund.returnPercent

              )

            : "--"

        ]

      ],

      headStyles: {

        fillColor: [

          22,

          163,

          74

        ]

      }

    }

  );

  // ======================================
  // MF vs FD
  // ======================================

  autoTable(

    doc,

    {

      startY:

        doc.lastAutoTable.finalY +

        12,

      head: [[

        "MF vs Fixed Deposit",

        "Value"

      ]],

      body: [

        [

          "Mutual Fund",

          formatCurrency(

            summary.currentValue

          )

        ],

        [

          "Equivalent FD",

          formatCurrency(

            fdValue

          )

        ],

        [

          "Difference",

          formatCurrency(

            summary.currentValue -

            fdValue

          )

        ]

      ],

      headStyles: {

        fillColor: [

          245,

          158,

          11

        ]

      }

    }

  );

  // ======================================
  // Portfolio Health
  // ======================================

  const portfolioScore =
    Math.min(

      100,

      Math.round(

        (

          summary.returnPercent +

          20

        ) * 2 +

        holdings.length * 8

      )

    );

  const diversification =

    holdings.length >= 5

      ? "Excellent"

      : holdings.length >= 3

      ? "Good"

      : "Needs Improvement";

  const riskLevel =

    summary.equityPercent >= 80

      ? "High"

      : summary.equityPercent >= 50

      ? "Balanced"

      : "Conservative";

  autoTable(

    doc,

    {

      startY:

        doc.lastAutoTable.finalY +

        12,

      head: [[

        "Portfolio Health",

        "Status"

      ]],

      body: [

        [

          "Portfolio Score",

          `${portfolioScore}/100`

        ],

        [

          "Risk Level",

          riskLevel

        ],

        [

          "Diversification",

          diversification

        ],

        [

          "Funds Count",

          holdings.length

        ]

      ],

      headStyles: {

        fillColor: [

          14,

          165,

          233

        ]

      }

    }

  );
    // ======================================
  // Portfolio Insights
  // ======================================

  const insights = [];

  if (summary.returnPercent >= 15) {

    insights.push(

      "Portfolio is generating excellent long-term returns."

    );

  } else if (summary.returnPercent >= 10) {

    insights.push(

      "Portfolio performance is above average."

    );

  } else {

    insights.push(

      "Portfolio has room for improving long-term returns."

    );

  }

  if (summary.currentValue > fdValue) {

    insights.push(

      `Mutual Fund portfolio is outperforming FD by ${formatCurrency(summary.currentValue - fdValue)}.`

    );

  } else {

    insights.push(

      "Current FD value is higher than Mutual Fund portfolio."

    );

  }

  if (holdings.length >= 5) {

    insights.push(

      "Portfolio is well diversified across multiple funds."

    );

  } else {

    insights.push(

      "Consider increasing diversification by adding more quality funds."

    );

  }

  if (summary.equityPercent >= 80) {

    insights.push(

      "High equity allocation may increase volatility."

    );

  } else if (summary.equityPercent >= 50) {

    insights.push(

      "Portfolio has balanced equity exposure."

    );

  } else {

    insights.push(

      "Portfolio is relatively conservative."

    );

  }

  if (bestFund) {

    insights.push(

      `Best performing fund: ${bestFund.fundName} (${formatPercent(bestFund.returnPercent)}).`

    );

  }

  autoTable(

    doc,

    {

      startY:

        doc.lastAutoTable.finalY +

        12,

      head: [[

        "Automatic Portfolio Insights"

      ]],

      body:

        insights.map(

          item => [

            item

          ]

        ),

      headStyles: {

        fillColor: [

          34,

          197,

          94

        ]

      },

      styles: {

        fontSize: 10

      }

    }

  );

  // ======================================
  // Disclaimer
  // ======================================

  autoTable(

    doc,

    {

      startY:

        doc.lastAutoTable.finalY +

        12,

      head: [[

        "Disclaimer"

      ]],

      body: [[

        "This report is generated automatically for informational purposes only. It should not be considered financial or investment advice. Mutual Fund investments are subject to market risks. Please read all scheme related documents carefully before investing."

      ]],

      headStyles: {

        fillColor: [

          107,

          114,

          128

        ]

      },

      styles: {

        fontSize: 9

      }

    }

  );

  // ======================================
  // Footer
  // ======================================

  const pageCount =

    doc.internal.getNumberOfPages();

  for (

    let i = 1;

    i <= pageCount;

    i++

  ) {

    doc.setPage(i);

    doc.setDrawColor(

      220,

      220,

      220

    );

    doc.line(

      10,

      283,

      200,

      283

    );

    doc.setFontSize(

      9

    );

    doc.setTextColor(

      120,

      120,

      120

    );

    doc.text(

      "Generated by MF Portfolio Manager",

      14,

      288

    );

    doc.text(

      `Page ${i} of ${pageCount}`,

      170,

      288

    );

  }

  // ======================================
  // Download
  // ======================================

  doc.save(

    `Portfolio_Report_${today.replaceAll("/", "-")}.pdf`

  );

};
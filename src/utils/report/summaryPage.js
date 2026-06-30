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
  // Title
  // ======================================

  doc.setFontSize(22);

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.text(

    "Executive Summary",

    14,

    18

  );

  doc.setFontSize(11);

  doc.setTextColor(

    120,

    120,

    120

  );

  doc.text(

    "Overall portfolio performance at a glance.",

    14,

    26

  );

  // ======================================
  // KPI BOX
  // ======================================

  const drawCard = (

    x,

    y,

    title,

    value,

    color

  ) => {

    doc.setFillColor(

      ...color

    );

    doc.roundedRect(

      x,

      y,

      42,

      24,

      3,

      3,

      "F"

    );

    doc.setTextColor(

      255,

      255,

      255

    );

    doc.setFontSize(9);

    doc.text(

      title,

      x + 3,

      y + 8

    );

    doc.setFontSize(12);

    doc.text(

      value,

      x + 3,

      y + 17

    );

  };

  drawCard(

    14,

    38,

    "Invested",

    `₹${summary.totalInvested.toLocaleString("en-IN")}`,

    [37,99,235]

  );

  drawCard(

    60,

    38,

    "Current",

    `₹${summary.currentValue.toLocaleString("en-IN")}`,

    [22,163,74]

  );

  drawCard(

    106,

    38,

    "Return",

    `${summary.returnPercent.toFixed(2)}%`,

    [245,158,11]

  );

  drawCard(

    152,

    38,

    "Score",

    `${portfolioScore}/100`,

    [99,102,241]

  );
    // ======================================
  // Summary Table
  // ======================================

  autoTable(

    doc,

    {

      startY: 72,

      theme: "grid",

      head: [[

        "Metric",

        "Value"

      ]],

      body: [

        [

          "Total Invested",

          `₹${summary.totalInvested.toLocaleString("en-IN")}`

        ],

        [

          "Current Value",

          `₹${summary.currentValue.toLocaleString("en-IN")}`

        ],

        [

          "Profit / Loss",

          `₹${summary.profitLoss.toLocaleString("en-IN")}`

        ],

        [

          "Return",

          `${summary.returnPercent.toFixed(2)}%`

        ],

        [

          "Portfolio Score",

          `${portfolioScore}/100`

        ],

        [

          "Total Funds",

          totalFunds

        ],

        [

          "Equity Allocation",

          `${summary.equityPercent.toFixed(1)}%`

        ],

        [

          "Debt Allocation",

          `${summary.debtPercent.toFixed(1)}%`

        ],

        [

          "Liquid Allocation",

          `${summary.liquidPercent.toFixed(1)}%`

        ],

        [

          "Wealth Multiplier",

          `${wealthMultiplier.toFixed(2)}x`

        ]

      ],

      headStyles: {

        fillColor: [

          37,

          99,

          235

        ],

        textColor: 255,

        fontStyle: "bold"

      },

      styles: {

        fontSize: 9,

        cellPadding: 3

      },

      alternateRowStyles: {

        fillColor: [

          247,

          248,

          250

        ]

      }

    }

  );

  // ======================================
  // Performance Badge
  // ======================================

  let badge = "Average";

  let badgeColor = [

    234,

    179,

    8

  ];

  if (

    summary.returnPercent >= 20

  ) {

    badge =

      "Excellent";

    badgeColor = [

      22,

      163,

      74

    ];

  }

  else if (

    summary.returnPercent >= 10

  ) {

    badge =

      "Good";

    badgeColor = [

      37,

      99,

      235

    ];

  }

  const badgeY =

    doc.lastAutoTable.finalY + 10;

  doc.setFillColor(

    ...badgeColor

  );

  doc.roundedRect(

    14,

    badgeY,

    182,

    16,

    4,

    4,

    "F"

  );

  doc.setTextColor(

    255,

    255,

    255

  );

  doc.setFontSize(12);

  doc.text(

    `Overall Portfolio Performance : ${badge}`,

    20,

    badgeY + 10

  );
    // ======================================
  // Asset Allocation
  // ======================================

  const chartStartY =

    badgeY + 28;

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.setFontSize(

    16

  );

  doc.text(

    "Asset Allocation",

    14,

    chartStartY

  );

  // ======================================
  // Pie Chart
  // ======================================

  if (

    allocationChartImage

  ) {

    doc.addImage(

      allocationChartImage,

      "PNG",

      18,

      chartStartY + 8,

      85,

      85

    );

  }

  // ======================================
  // Legend
  // ======================================

  const legendX = 122;

  let legendY =

    chartStartY + 18;

  const drawLegend = (

    color,

    label,

    percent,

    value

  ) => {

    doc.setFillColor(

      ...color

    );

    doc.rect(

      legendX,

      legendY,

      6,

      6,

      "F"

    );

    doc.setFontSize(

      10

    );

    doc.setTextColor(

      60,

      60,

      60

    );

    doc.text(

      label,

      legendX + 10,

      legendY + 5

    );

    doc.setFontSize(

      9

    );

    doc.text(

      `${percent.toFixed(1)}%`,

      legendX + 48,

      legendY + 5

    );

    doc.text(

      `₹${Number(

        value

      ).toLocaleString(

        "en-IN"

      )}`,

      legendX + 68,

      legendY + 5

    );

    legendY += 16;

  };

  drawLegend(

    [37,99,235],

    "Equity",

    summary.equityPercent,

    summary.equityValue

  );

  drawLegend(

    [22,163,74],

    "Debt",

    summary.debtPercent,

    summary.debtValue

  );

  drawLegend(

    [245,158,11],

    "Liquid",

    summary.liquidPercent,

    summary.liquidValue

  );

  // ======================================
  // Summary Note
  // ======================================

  doc.setFontSize(

    9

  );

  doc.setTextColor(

    120,

    120,

    120

  );

  doc.text(

    "Asset allocation is based on the current market value of your portfolio.",

    14,

    278

  );

  // ======================================
  // Next Page
  // ======================================

  doc.addPage();

};
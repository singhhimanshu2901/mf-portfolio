import autoTable from "jspdf-autotable";

// ======================================
// Portfolio Analysis
// ======================================

export const analysisPage = (

  doc,

  {

    summary,

    holdings,

    fdValue,

    portfolioScore

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

    "Portfolio Analysis",

    14,

    18

  );

  doc.setFontSize(

    11

  );

  doc.setTextColor(

    110,

    110,

    110

  );

  doc.text(

    "Comprehensive health analysis of your portfolio.",

    14,

    26

  );

  // ======================================
  // Health Cards
  // ======================================

  const drawCard = (

    x,

    title,

    value,

    color

  ) => {

    doc.setFillColor(

      ...color

    );

    doc.roundedRect(

      x,

      38,

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

    doc.setFontSize(

      9

    );

    doc.text(

      String(title),

      x + 3,

      46

    );

    doc.setFontSize(

      12

    );

    doc.text(

      String(value),

      x + 3,

      56

    );

  };

  drawCard(

    14,

    "Health",

    `${portfolioScore}/100`,

    [37,99,235]

  );

  drawCard(

    60,

    "Funds",

    holdings.length,

    [22,163,74]

  );

  drawCard(

    106,

    "Return",

    `${summary.returnPercent.toFixed(2)}%`,

    [245,158,11]

  );

  drawCard(

    152,

    "MF vs FD",

    `₹${(
      summary.currentValue -
      fdValue
    ).toLocaleString("en-IN")}`,

    summary.currentValue >= fdValue

      ? [22,163,74]

      : [220,38,38]

  );

  // ======================================
  // Risk Profile
  // ======================================

  let risk =

    "Balanced";

  if (

    summary.equityPercent >= 80

  ) {

    risk =

      "High";

  }

  else if (

    summary.equityPercent <= 40

  ) {

    risk =

      "Conservative";

  }

  // ======================================
  // Diversification
  // ======================================

  let diversification =

    "Average";

  if (

    holdings.length >= 8

  ) {

    diversification =

      "Excellent";

  }

  else if (

    holdings.length >= 5

  ) {

    diversification =

      "Good";

  }
    // ======================================
  // Analysis Table
  // ======================================

  autoTable(

    doc,

    {

      startY: 74,

      theme: "grid",

      head: [[

        "Analysis",

        "Result"

      ]],

      body: [

        [

          "Portfolio Health",

          `${portfolioScore}/100`

        ],

        [

          "Risk Profile",

          risk

        ],

        [

          "Diversification",

          diversification

        ],

        [

          "Current Portfolio",

          `₹${summary.currentValue.toLocaleString("en-IN")}`

        ],

        [

          "Equivalent FD",

          `₹${fdValue.toLocaleString("en-IN")}`

        ],

        [

          "MF Advantage",

          `₹${(

            summary.currentValue -

            fdValue

          ).toLocaleString("en-IN")}`

        ],

        [

          "Equity Allocation",

          `${summary.equityPercent.toFixed(2)}%`

        ],

        [

          "Debt Allocation",

          `${summary.debtPercent.toFixed(2)}%`

        ],

        [

          "Liquid Allocation",

          `${summary.liquidPercent.toFixed(2)}%`

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
  // Health Meter
  // ======================================

  const meterY =

    doc.lastAutoTable.finalY + 15;

  doc.setFontSize(

    13

  );

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.text(

    "Portfolio Health Score",

    14,

    meterY

  );

  // Background

  doc.setFillColor(

    230,

    230,

    230

  );

  doc.roundedRect(

    14,

    meterY + 6,

    182,

    8,

    3,

    3,

    "F"

  );

  // Fill

  let meterColor = [

    245,

    158,

    11

  ];

  if (

    portfolioScore >= 85

  ) {

    meterColor = [

      22,

      163,

      74

    ];

  }

  else if (

    portfolioScore >= 65

  ) {

    meterColor = [

      37,

      99,

      235

    ];

  }

  doc.setFillColor(

    ...meterColor

  );

  doc.roundedRect(

    14,

    meterY + 6,

    (

      portfolioScore /

      100

    ) * 182,

    8,

    3,

    3,

    "F"

  );

  doc.setFontSize(

    10

  );

  doc.setTextColor(

    70,

    70,

    70

  );

  doc.text(

    `${portfolioScore}/100`,

    172,

    meterY + 20

  );
    // ======================================
  // Long Term Outlook
  // ======================================

  const outlookY =

    meterY + 32;

  let outlook = "";

  let recommendation = "";

  let strength = "";

  if (

    portfolioScore >= 85

  ) {

    strength = "Excellent";

    outlook =
      "Your portfolio demonstrates excellent long-term potential with strong diversification and healthy expected returns.";

    recommendation =
      "Continue SIPs regularly and rebalance annually to maintain your asset allocation.";

  }

  else if (

    portfolioScore >= 70

  ) {

    strength = "Good";

    outlook =
      "Your portfolio is well positioned for long-term wealth creation with only minor improvements needed.";

    recommendation =
      "Continue investing consistently and review underperforming funds every 6–12 months.";

  }

  else if (

    portfolioScore >= 50

  ) {

    strength = "Average";

    outlook =
      "Your portfolio has moderate growth potential but can benefit from better diversification and fund selection.";

    recommendation =
      "Review your allocation, reduce overlap, and consider adding quality diversified funds.";

  }

  else {

    strength = "Needs Improvement";

    outlook =
      "Your portfolio currently has weak diversification or low performance. Strategic changes may improve long-term outcomes.";

    recommendation =
      "Review investment strategy, rebalance holdings, and avoid making decisions based only on short-term market movements.";

  }

  // ======================================
  // Portfolio Strength Card
  // ======================================

  const strengthColor =

    portfolioScore >= 85

      ? [22,163,74]

      : portfolioScore >= 70

      ? [37,99,235]

      : portfolioScore >= 50

      ? [245,158,11]

      : [220,38,38];

  doc.setFillColor(

    ...strengthColor

  );

  doc.roundedRect(

    14,

    outlookY,

    182,

    18,

    4,

    4,

    "F"

  );

  doc.setTextColor(

    255,

    255,

    255

  );

  doc.setFontSize(

    12

  );

  doc.text(

    `Portfolio Strength : ${strength}`,

    20,

    outlookY + 11

  );

  // ======================================
  // Long-Term Outlook
  // ======================================

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.setFontSize(

    13

  );

  doc.text(

    "Expected Long-Term Outlook",

    14,

    outlookY + 32

  );

  doc.setFontSize(

    9

  );

  doc.setTextColor(

    90,

    90,

    90

  );

  const outlookLines =

    doc.splitTextToSize(

      outlook,

      182

    );

  doc.text(

    outlookLines,

    14,

    outlookY + 42

  );

  // ======================================
  // Recommendation
  // ======================================

  const recommendationY =

    outlookY +

    58;

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.setFontSize(

    13

  );

  doc.text(

    "Recommendation",

    14,

    recommendationY

  );

  doc.setFontSize(

    9

  );

  doc.setTextColor(

    90,

    90,

    90

  );

  const recommendationLines =

    doc.splitTextToSize(

      recommendation,

      182

    );

  doc.text(

    recommendationLines,

    14,

    recommendationY + 10

  );

  // ======================================
  // Footer Note
  // ======================================

  doc.setFontSize(

    8

  );

  doc.setTextColor(

    140,

    140,

    140

  );

  doc.text(

    "Analysis is generated automatically using your portfolio data and should be used for informational purposes only.",

    14,

    285

  );

  // ======================================
  // Next Page
  // ======================================

  doc.addPage();

};
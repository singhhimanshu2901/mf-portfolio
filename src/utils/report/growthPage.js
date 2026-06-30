import autoTable from "jspdf-autotable";

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

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.text(

    "Portfolio Growth",

    14,

    18

  );

  doc.setFontSize(11);

  doc.setTextColor(

    110,

    110,

    110

  );

  doc.text(

    "Historical portfolio growth and performance analysis.",

    14,

    26

  );

  // ======================================
  // Calculations
  // ======================================

  const invested =

    summary.totalInvested;

  const current =

    summary.currentValue;

  const gain =

    current -

    invested;

  const gainPercent =

    invested > 0

      ? (

          gain /

          invested

        ) * 100

      : 0;

  const highestValue =

    portfolioHistory.length

      ? Math.max(

          ...portfolioHistory.map(

            item =>

              item.value

          )

        )

      : current;

  const lowestValue =

    portfolioHistory.length

      ? Math.min(

          ...portfolioHistory.map(

            item =>

              item.value

          )

        )

      : invested;

  // ======================================
  // KPI Cards
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

      36,

      42,

      22,

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

      44

    );

    doc.setFontSize(11);

    doc.text(

      value,

      x + 3,

      53

    );

  };

  drawCard(

    14,

    "Current",

    `₹${current.toLocaleString("en-IN")}`,

    [37,99,235]

  );

  drawCard(

    60,

    "Gain",

    `₹${gain.toLocaleString("en-IN")}`,

    gain >= 0

      ? [22,163,74]

      : [220,38,38]

  );

  drawCard(

    106,

    "Growth",

    `${gainPercent.toFixed(2)}%`,

    [245,158,11]

  );

  drawCard(

    152,

    "XIRR",

    `${xirr.toFixed(2)}%`,

    [99,102,241]

  );
    // ======================================
  // Growth Chart
  // ======================================

  const chartY = 72;

  doc.setFontSize(16);

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.text(

    "Portfolio Growth Trend",

    14,

    chartY

  );

  if (

    growthChartImage

  ) {

    doc.addImage(

      growthChartImage,

      "PNG",

      14,

      chartY + 6,

      182,

      82

    );

  }

  // ======================================
  // Growth Statistics
  // ======================================

  autoTable(

    doc,

    {

      startY:

        chartY + 95,

      theme: "grid",

      head: [[

        "Metric",

        "Value"

      ]],

      body: [

        [

          "Current Portfolio Value",

          `₹${current.toLocaleString(

            "en-IN"

          )}`

        ],

        [

          "Highest Portfolio Value",

          `₹${highestValue.toLocaleString(

            "en-IN"

          )}`

        ],

        [

          "Lowest Portfolio Value",

          `₹${lowestValue.toLocaleString(

            "en-IN"

          )}`

        ],

        [

          "Total Gain",

          `₹${gain.toLocaleString(

            "en-IN"

          )}`

        ],

        [

          "Growth Percentage",

          `${gainPercent.toFixed(

            2

          )}%`

        ],

        [

          "Portfolio CAGR",

          `${cagr.toFixed(

            2

          )}%`

        ],

        [

          "Portfolio XIRR",

          `${xirr.toFixed(

            2

          )}%`

        ],

        [

          "Total Holdings",

          holdings.length

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

  let performance =

    "Average";

  let badgeColor = [

    245,

    158,

    11

  ];

  if (

    gainPercent >= 20

  ) {

    performance =

      "Excellent";

    badgeColor = [

      22,

      163,

      74

    ];

  }

  else if (

    gainPercent >= 10

  ) {

    performance =

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

    15,

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

    `Portfolio Performance : ${performance}`,

    20,

    badgeY + 10

  );

  // ======================================
  // Growth Interpretation
  // ======================================

  let message = "";

  if (

    gainPercent >= 20

  ) {

    message =

      "Outstanding long-term portfolio growth with consistently strong performance.";

  }

  else if (

    gainPercent >= 10

  ) {

    message =

      "Portfolio is generating healthy long-term returns and is outperforming most traditional investments.";

  }

  else if (

    gainPercent >= 0

  ) {

    message =

      "Portfolio is profitable but there is room for improving overall returns through periodic review.";

  }

  else {

    message =

      "Portfolio is currently below invested value. Market fluctuations are normal; review your allocation before making decisions.";

  }

  doc.setTextColor(

    70,

    70,

    70

  );

  doc.setFontSize(

    10

  );

  doc.text(

    "Performance Interpretation",

    14,

    badgeY + 28

  );

  doc.setFontSize(

    9

  );

  const lines = doc.splitTextToSize(

    message,

    180

  );

  doc.text(

    lines,

    14,

    badgeY + 38

  );

  // ======================================
  // Timeline
  // ======================================

  const timelineY =

    badgeY + 62;

  doc.setFontSize(

    12

  );

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.text(

    "Portfolio Timeline",

    14,

    timelineY

  );

  if (

    portfolioHistory.length

  ) {

    const firstDate =

      portfolioHistory[0]?.date;

    const lastDate =

      portfolioHistory[

        portfolioHistory.length - 1

      ]?.date;

    doc.setFontSize(

      10

    );

    doc.setTextColor(

      90,

      90,

      90

    );

    doc.text(

      `From : ${firstDate}`,

      18,

      timelineY + 12

    );

    doc.text(

      `To : ${lastDate}`,

      18,

      timelineY + 22

    );

    doc.text(

      `Data Points : ${portfolioHistory.length}`,

      18,

      timelineY + 32

    );

  }

  else {

    doc.setFontSize(

      10

    );

    doc.setTextColor(

      120,

      120,

      120

    );

    doc.text(

      "Historical portfolio timeline is currently unavailable.",

      18,

      timelineY + 14

    );

  }

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

    "Growth analysis is based on historical portfolio values and current NAV data.",

    14,

    285

  );

  // ======================================
  // Next Page
  // ======================================

  doc.addPage();

};
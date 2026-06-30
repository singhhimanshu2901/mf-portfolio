import autoTable from "jspdf-autotable";

// ======================================
// Smart Portfolio Insights
// ======================================

export const insightsPage = (

  doc,

  {

    summary,

    holdings,

    fdValue

  }

) => {

  doc.setFontSize(22);

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.text(

    "Smart Portfolio Insights",

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

    "Automatically generated insights based on your current portfolio.",

    14,

    26

  );

  // ======================================
  // Generate Insights
  // ======================================

  const insights = [];

  // Return

  if (

    summary.returnPercent >= 20

  ) {

    insights.push({

      type: "Excellent Returns",

      message:
        "Your portfolio has generated excellent returns and is performing exceptionally well."

    });

  }

  else if (

    summary.returnPercent >= 10

  ) {

    insights.push({

      type: "Healthy Growth",

      message:
        "Portfolio is delivering healthy long-term returns."

    });

  }

  else {

    insights.push({

      type: "Growth Opportunity",

      message:
        "Returns can be improved through periodic review and better diversification."

    });

  }

  // MF vs FD

  if (

    summary.currentValue >

    fdValue

  ) {

    insights.push({

      type: "MF Beats FD",

      message:
        `Your Mutual Fund portfolio is outperforming Fixed Deposit by ₹${(

          summary.currentValue -

          fdValue

        ).toLocaleString(

          "en-IN"

        )}.`

    });

  }

  else {

    insights.push({

      type: "FD Ahead",

      message:
        "Current FD value is higher than your portfolio. Long-term investing may improve outcomes."

    });

  }

  // Diversification

  if (

    holdings.length >= 8

  ) {

    insights.push({

      type:"Diversification",

      message:
      "Excellent diversification across multiple mutual funds."

    });

  }

  else if (

    holdings.length >=5

  ) {

    insights.push({

      type:"Diversification",

      message:
      "Portfolio diversification is good."

    });

  }

  else{

    insights.push({

      type:"Diversification",

      message:
      "Consider adding more quality funds to reduce concentration risk."

    });

  }

  // Equity

  if(

    summary.equityPercent>=80

  ){

    insights.push({

      type:"Risk",

      message:
      "High equity exposure may increase volatility during market corrections."

    });

  }

  else if(

    summary.equityPercent>=50

  ){

    insights.push({

      type:"Risk",

      message:
      "Portfolio has balanced equity allocation."

    });

  }

  else{

    insights.push({

      type:"Risk",

      message:
      "Portfolio is relatively conservative."

    });

  }
    // ======================================
  // Best & Worst Fund
  // ======================================

  const sorted =

    [...holdings].sort(

      (a, b) =>

        (b.returnPercent || 0) -

        (a.returnPercent || 0)

    );

  const bestFund =

    sorted[0];

  const worstFund =

    sorted[

      sorted.length - 1

    ];

  insights.push({

    type: "Best Performer",

    message:

      bestFund

        ? `${bestFund.fundName} has delivered ${Number(

            bestFund.returnPercent || 0

          ).toFixed(

            2

          )}% return.`

        : "--"

  });

  insights.push({

    type: "Needs Attention",

    message:

      worstFund

        ? `${worstFund.fundName} is currently the weakest performer.`

        : "--"

  });

  // ======================================
  // Smart Suggestions
  // ======================================

  if (

    summary.returnPercent < 12

  ) {

    insights.push({

      type: "Suggestion",

      message:

        "Review underperforming funds and consider reallocating future SIPs into consistently performing funds."

    });

  }

  if (

    holdings.length < 5

  ) {

    insights.push({

      type: "Suggestion",

      message:

        "Increasing diversification may help reduce concentration risk."

    });

  }

  if (

    summary.liquidPercent >

    20

  ) {

    insights.push({

      type: "Suggestion",

      message:

        "Large liquid allocation may reduce long-term growth potential if it is not intentional."

    });

  }

  // ======================================
  // Insights Table
  // ======================================

  autoTable(

    doc,

    {

      startY: 38,

      theme: "grid",

      head: [[

        "Insight",

        "Observation"

      ]],

      body:

        insights.map(

          item => [

            item.type,

            item.message

          ]

        ),

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

        cellPadding: 3,

        overflow: "linebreak"

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
  // Portfolio Rating
  // ======================================

  const score =

    Math.min(

      100,

      Math.max(

        0,

        Math.round(

          summary.returnPercent +

          holdings.length * 5

        )

      )

    );

  let rating =

    "Bronze";

  let color = [

    180,

    83,

    9

  ];

  if (

    score >= 85

  ) {

    rating =

      "Gold";

    color = [

      22,

      163,

      74

    ];

  }

  else if (

    score >= 70

  ) {

    rating =

      "Silver";

    color = [

      37,

      99,

      235

    ];

  }

  // ======================================
  // Rating Card
  // ======================================

  const ratingY =

    doc.lastAutoTable.finalY + 15;

  doc.setFillColor(

    ...color

  );

  doc.roundedRect(

    14,

    ratingY,

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

    13

  );

  doc.text(

    `Overall Portfolio Rating : ${rating}`,

    20,

    ratingY + 11

  );

  // ======================================
  // Overall Conclusion
  // ======================================

  let conclusion =

    "";

  if (

    score >= 85

  ) {

    conclusion =

      "Your portfolio demonstrates excellent diversification, strong returns and healthy long-term wealth creation potential.";

  }

  else if (

    score >= 70

  ) {

    conclusion =

      "Your portfolio is performing well. Continue disciplined investing and review asset allocation periodically.";

  }

  else if (

    score >= 50

  ) {

    conclusion =

      "Portfolio performance is satisfactory, but diversification and fund selection can be improved.";

  }

  else {

    conclusion =

      "Portfolio needs attention. Review allocation, underperforming funds and investment strategy.";

  }

  doc.setFontSize(

    13

  );

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.text(

    "Overall Conclusion",

    14,

    ratingY + 34

  );

  doc.setFontSize(

    9

  );

  doc.setTextColor(

    90,

    90,

    90

  );

  const conclusionLines =

    doc.splitTextToSize(

      conclusion,

      182

    );

  doc.text(

    conclusionLines,

    14,

    ratingY + 45

  );

  // ======================================
  // Disclaimer
  // ======================================

  doc.setFontSize(

    11

  );

  doc.setTextColor(

    220,

    38,

    38

  );

  doc.text(

    "Disclaimer",

    14,

    ratingY + 72

  );

  doc.setFontSize(

    8

  );

  doc.setTextColor(

    110,

    110,

    110

  );

  const disclaimer =

    "This report is automatically generated using portfolio data and available NAV information. It is intended for educational and informational purposes only and should not be considered financial or investment advice. Please consult a SEBI-registered investment advisor before making investment decisions.";

  const disclaimerLines =

    doc.splitTextToSize(

      disclaimer,

      182

    );

  doc.text(

    disclaimerLines,

    14,

    ratingY + 82

  );

};
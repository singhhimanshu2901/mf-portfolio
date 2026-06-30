import autoTable from "jspdf-autotable";

// ======================================
// Holdings Page
// ======================================

export const holdingsPage = (

  doc,

  {

    holdings

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

    "Portfolio Holdings",

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

    "Detailed analysis of every mutual fund in your portfolio.",

    14,

    26

  );

  // ======================================
  // Sort By Current Value
  // ======================================

  const sorted =

    [...holdings].sort(

      (a,b)=>

      b.currentValue -

      a.currentValue

    );

  // ======================================
  // Table
  // ======================================

  autoTable(

    doc,

    {

      startY:38,

      theme:"grid",

      head:[[
                "Rank",

        "Fund",

        "Invested",

        "Current",

        "P/L",

        "Return",

        "XIRR"

      ]],

      body:

      sorted.map(

        (

          fund,

          index

        )=>

        [

          index+1,

          fund.fundName,

          `₹${Number(

            fund.invested

          ).toLocaleString(

            "en-IN"

          )}`,

          `₹${Number(

            fund.currentValue

          ).toLocaleString(

            "en-IN"

          )}`,

          `₹${Number(

            fund.profit

          ).toLocaleString(

            "en-IN"

          )}`,

          `${Number(

            fund.returnPercent

          ).toFixed(

            2

          )}%`,

          `${Number(

            fund.xirr

          ).toFixed(

            2

          )}%`

        ]

      ),

      headStyles:{

        fillColor:[

          37,

          99,

          235

        ],

        textColor:255,

        fontStyle:"bold"

      },

      styles:{

        fontSize:8,

        cellPadding:2,

        valign:"middle"

      },

      alternateRowStyles:{

        fillColor:[

          247,

          248,

          250

        ]

      },
            didParseCell: function (data) {

        if (

          data.section === "body" &&

          data.column.index === 4

        ) {

          const value =

            sorted[

              data.row.index

            ].profit;

          if (

            value >= 0

          ) {

            data.cell.styles.textColor = [

              22,

              163,

              74

            ];

          }

          else {

            data.cell.styles.textColor = [

              220,

              38,

              38

            ];

          }

        }

        if (

          data.section === "body" &&

          data.column.index === 5

        ) {

          const value =

            sorted[

              data.row.index

            ].returnPercent;

          if (

            value >= 0

          ) {

            data.cell.styles.textColor = [

              22,

              163,

              74

            ];

          }

          else {

            data.cell.styles.textColor = [

              220,

              38,

              38

            ];

          }

        }

      }

    }

  );

  // ======================================
  // Best / Worst Holding
  // ======================================

  const bestFund =

    [...sorted].sort(

      (a, b) =>

        b.returnPercent -

        a.returnPercent

    )[0];

  const worstFund =

    [...sorted].sort(

      (a, b) =>

        a.returnPercent -

        b.returnPercent

    )[0];

  const totalValue =

    sorted.reduce(

      (

        sum,

        fund

      ) =>

        sum +

        Number(

          fund.currentValue || 0

        ),

      0

    );

  const infoY =

    doc.lastAutoTable.finalY + 12;

  doc.setFontSize(

    15

  );

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.text(

    "Holdings Overview",

    14,

    infoY

  );

  // ======================================
  // Best Performer Card
  // ======================================

  doc.setFillColor(

    22,

    163,

    74

  );

  doc.roundedRect(

    14,

    infoY + 8,

    88,

    28,

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

    11

  );

  doc.text(

    "Best Performer",

    18,

    infoY + 17

  );

  doc.setFontSize(

    9

  );

  doc.text(

    bestFund?.fundName ||

      "--",

    18,

    infoY + 25

  );

  doc.text(

    `${Number(

      bestFund?.returnPercent || 0

    ).toFixed(

      2

    )}% Return`,

    18,

    infoY + 32

  );

  // ======================================
  // Worst Performer Card
  // ======================================

  doc.setFillColor(

    220,

    38,

    38

  );

  doc.roundedRect(

    108,

    infoY + 8,

    88,

    28,

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

    11

  );

  doc.text(

    "Needs Attention",

    112,

    infoY + 17

  );

  doc.setFontSize(

    9

  );

  doc.text(

    worstFund?.fundName ||

      "--",

    112,

    infoY + 25

  );

  doc.text(

    `${Number(

      worstFund?.returnPercent || 0

    ).toFixed(

      2

    )}% Return`,

    112,

    infoY + 32

  );
    // ======================================
  // Portfolio Holdings Summary
  // ======================================

  const summaryY = infoY + 48;

  const averageReturn =
    sorted.length
      ? sorted.reduce(
          (sum, fund) =>
            sum + Number(fund.returnPercent || 0),
          0
        ) / sorted.length
      : 0;

  const top5Value =
    sorted
      .slice(0, 5)
      .reduce(
        (sum, fund) =>
          sum + Number(fund.currentValue || 0),
        0
      );

  const top5Contribution =
    totalValue > 0
      ? (top5Value / totalValue) * 100
      : 0;

  autoTable(

    doc,

    {

      startY: summaryY,

      theme: "grid",

      head: [[

        "Portfolio Metric",

        "Value"

      ]],

      body: [

        [

          "Total Holdings",

          sorted.length

        ],

        [

          "Current Portfolio Value",

          `₹${totalValue.toLocaleString("en-IN")}`

        ],

        [

          "Average Return",

          `${averageReturn.toFixed(2)}%`

        ],

        [

          "Top 5 Contribution",

          `${top5Contribution.toFixed(2)}%`

        ],

        [

          "Best Performer",

          bestFund?.fundName || "--"

        ],

        [

          "Worst Performer",

          worstFund?.fundName || "--"

        ]

      ],

      headStyles: {

        fillColor: [

          37,

          99,

          235

        ],

        textColor: 255

      },

      alternateRowStyles: {

        fillColor: [

          247,

          248,

          250

        ]

      },

      styles: {

        fontSize: 9

      }

    }

  );

  // ======================================
  // Holdings Insight
  // ======================================

  let insight = "";

  if (

    top5Contribution >= 75

  ) {

    insight =
      "Your portfolio is highly concentrated. Consider diversifying into additional quality funds.";

  }

  else if (

    top5Contribution >= 55

  ) {

    insight =
      "Your portfolio has a balanced allocation with moderate concentration.";

  }

  else {

    insight =
      "Excellent diversification across multiple mutual funds.";

  }

  doc.setFontSize(

    12

  );

  doc.setTextColor(

    30,

    41,

    59

  );

  doc.text(

    "Holdings Insight",

    14,

    doc.lastAutoTable.finalY + 16

  );

  doc.setFontSize(

    9

  );

  doc.setTextColor(

    90,

    90,

    90

  );

  const lines = doc.splitTextToSize(

    insight,

    182

  );

  doc.text(

    lines,

    14,

    doc.lastAutoTable.finalY + 26

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

    "Holdings are ranked by current market value. Performance metrics are based on the latest available NAV.",

    14,

    285

  );

  // ======================================
  // Next Page
  // ======================================

  doc.addPage();

};
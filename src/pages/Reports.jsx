import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import {
  getPortfolioSummary,
  getPortfolioHoldings,
  getInvestments
} from "../services/portfolioService";

import {
  getCurrentUser,
  waitForAuth
} from "../services/authService";

import {
  calculatePortfolioFDValue
} from "../services/fdService";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
export default function Reports() {

  const [summary, setSummary] =
    useState(null);

  const [holdings, setHoldings] =
    useState([]);

 const formatCurrency = (amount) => {
  return `Rs. ${Number(amount).toLocaleString("en-IN")}`;
};
  const [topFund, setTopFund] =
    useState(null);

  const [fdValue, setFdValue] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport =
  async () => {

    try {

      let user =
        getCurrentUser();

      if (!user) {
        user =
          await waitForAuth();
      }

      if (!user) return;

      const summaryData =
        await getPortfolioSummary(
          user.uid
        );

      const holdingsData =
        await getPortfolioHoldings(
          user.uid
        );

      const transactions =
        await getInvestments(
          user.uid
        );

      const fdAmount =
        calculatePortfolioFDValue(
          transactions,
          Number(
            localStorage.getItem(
              "fdRate"
            ) || 7
          )
        );

      const sorted =
        [...holdingsData]
          .sort(
            (a, b) =>
              b.returnPercent -
              a.returnPercent
          );

      setTopFund(
        sorted[0]
      );

      setFdValue(
        fdAmount
      );

      setSummary(
        summaryData
      );

      setHoldings(
        holdingsData
      );

      setLoading(
        false
      );

    } catch (error) {

      console.error(
        error
      );

      setLoading(
        false
      );
    }
  };
  
 const downloadPDF = () => {

  const doc = new jsPDF();

  doc.setFillColor(
  37,
  99,
  235
);

doc.rect(
  0,
  0,
  210,
  30,
  "F"
);

doc.setTextColor(
  255,
  255,
  255
);

doc.setFontSize(22);

doc.text(
  "MF Portfolio Manager",
  14,
  18
);

doc.setFontSize(10);

doc.text(
  "Portfolio Performance Report",
  14,
  25
);

doc.text(
  `Generated On: ${new Date().toLocaleDateString()}`,
  140,
  18
);

doc.setTextColor(
  0,
  0,
  0
);

  autoTable(doc, {
    startY: 45,
    head: [["Metric", "Value"]],
    body: [
  [
    "Total Invested",
    formatCurrency(summary.totalInvested)
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
    "Return %",
    `${summary.returnPercent.toFixed(2)}%`
  ]
]
  });

  autoTable(doc, {
    startY:
      doc.lastAutoTable.finalY + 15,
    headStyles: {
  fillColor: [37, 99, 235],
  textColor: 255,
  fontStyle: "bold"
},

alternateRowStyles: {
  fillColor: [245, 245, 245]
},

styles: {
  fontSize: 9
},
    head: [[
  "#",
  "Fund Name",
  "Invested",
  "Current Value",
  "Gain / Loss",
  "Return %"
]],
    body: holdings
  .sort(
    (a, b) =>
      b.returnPercent -
      a.returnPercent
  )
  .map(
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
        fund.currentValue -
        fund.invested
      ),

      `${fund.returnPercent.toFixed(2)}%`
    ]
  )
  });

  autoTable(doc, {
    startY:
      doc.lastAutoTable.finalY + 15,
    head: [["MF vs FD", "Value"]],
    body: [
      [
        "Mutual Fund",
        formatCurrency(
          summary.currentValue
        )
      ],
      [
        "FD Value",
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
    ]
  });
const fundsCount =
  holdings.length;

const diversification =
  fundsCount >= 5
    ? "Excellent"
    : fundsCount >= 3
    ? "Good"
    : "Poor";

const riskLevel =
  summary.equityPercent > 80
    ? "Moderate"
    : summary.equityPercent > 50
    ? "Balanced"
    : "Low";

const portfolioScore =
  Math.min(
    100,
    Math.round(
      (summary.returnPercent + 20) * 2 +
      fundsCount * 8
    )
  );

autoTable(doc, {
  startY:
    doc.lastAutoTable.finalY + 15,

  head: [
    ["Portfolio Health", "Status"]
  ],

  body: [
    [
      "Funds Count",
      fundsCount
    ],
    [
      "Diversification",
      diversification
    ],
    [
      "Risk Level",
      riskLevel
    ],
    [
      "Portfolio Score",
      `${portfolioScore}/100`
    ]
  ],

  headStyles: {
    fillColor: [37, 99, 235]
  }
});



const bestFund =
  holdings.length > 0
    ? [...holdings].sort(
        (a, b) =>
          b.returnPercent -
          a.returnPercent
      )[0]
    : null;

autoTable(doc, {
  startY:
    doc.lastAutoTable.finalY + 15,

  head: [
    [
      "Best Performing Fund",
      "Value"
    ]
  ],

  body: [
    [
      "Fund Name",
      bestFund?.fundName ||
        "N/A"
    ],
    [
      "Invested",
      formatCurrency(summary.totalInvested)
    ],
    [
      "Current Value",
      formatCurrency(bestFund?.currentValue)
    ],
    [
      "Return %",
      `${bestFund?.returnPercent?.toFixed(2) || 0}%`
    ]
  ],

  headStyles: {
    fillColor: [22, 163, 74]
  }
});
const pageCount =
  doc.internal
    .getNumberOfPages();

for (
  let i = 1;
  i <= pageCount;
  i++
) {

  doc.setPage(i);

  doc.setFontSize(9);

  doc.setTextColor(
    120,
    120,
    120
  );

  doc.text(
    "Generated by MF Portfolio Manager",
    14,
    287
  );

  doc.text(
    `Page ${i} of ${pageCount}`,
    180,
    287
  );
}
  doc.save(
    "portfolio-report.pdf"
  );
};
  if (loading || !summary) {

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      Loading Report...
    </div>
  );
}

  return (
  <div className="flex bg-slate-950 text-white min-h-screen">

    <Sidebar />

    <div
  id="report-content"
  style={{
    background: "#020617",
    color: "#ffffff",
    padding: "20px"
  }}
>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Portfolio Report
        </h1>

        <button
          onClick={downloadPDF}
          className="bg-blue-600 px-5 py-3 rounded-lg font-semibold"
        >
          Download PDF
        </button>

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl">

          <h2 className="text-2xl font-bold mb-5">
            📈 Portfolio Performance
          </h2>

          <div className="space-y-4">

<div className="bg-slate-800 p-4 rounded-lg">  Current Value
  <br />
  ₹{summary?.currentValue?.toFixed(0) || 0}
</div>

<div className="bg-slate-800 p-4 rounded-lg">  Total Invested
  <br />
  ₹{summary?.totalInvested?.toFixed(0) || 0}
</div>

            <div className="bg-slate-800 p-4 rounded-lg">
              Profit / Loss
              <br />
              ₹{summary?.profitLoss?.toFixed(0) || 0}
            </div>

<div className="bg-slate-800 p-4 rounded-lg">              Return
              <br />
              {summary?.returnPercent?.toFixed(2) || 0}%
            </div>

          </div>

        </div>

        <div className="bg-slate-900 p-6 rounded-xl">

          <h2 className="text-2xl font-bold mb-5">
            🥧 Asset Allocation
          </h2>

          <div
  className="flex justify-center items-center"
  style={{
    height: "320px"
  }}
>

  <PieChart
    width={350}
    height={300}
  >

                <Pie
  data={[
    {
      name: "Equity",
      value: summary?.equityValue || 0
    },
    {
      name: "Debt",
      value: summary?.debtValue || 0
    },
    {
      name: "Liquid",
      value: summary?.liquidValue || 0
    }
  ]}
  dataKey="value"
  cx="50%"
  cy="50%"
  innerRadius={60}
  outerRadius={110}
  paddingAngle={3}
  label={({ name, percent }) =>
  percent > 0
    ? `${name} ${(percent * 100).toFixed(0)}%`
    : ""
}
labelLine={false}
>

                  <Cell fill="#3B82F6" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#10B981" />

                </Pie>

                <Tooltip />

              </PieChart>


          </div>

        </div>

      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">

        <div className="bg-slate-900 p-6 rounded-xl">

          <h2 className="text-xl font-bold mb-4">
            🏆 Top Performing Fund
          </h2>
          
          <p>
            {topFund?.fundName || "No Fund"}
          </p>

          <p className="mt-3">
            Invested:
            ₹{topFund?.invested?.toFixed(0)}
          </p>

          <p>
            Current:
            ₹{topFund?.currentValue?.toFixed(0)}
          </p>
          <p className="mt-4 text-green-400 font-bold">
  Return:
  {topFund?.returnPercent?.toFixed(2)}%
</p>

        </div>

        <div className="bg-slate-900 p-6 rounded-xl">

          <h2 className="text-xl font-bold mb-4">
            🏦 MF vs FD
          </h2>

          <p>
            Mutual Fund:
            ₹{summary.currentValue.toFixed(0)}
          </p>

          <p>
            FD Value:
            ₹{fdValue.toFixed(0)}
          </p>

          <p className="mt-3">

            Difference:

            <span
  className={
    summary.currentValue >= fdValue
      ? "text-green-400 font-bold"
      : "text-red-400 font-bold"
  }
>
  ₹{(
    summary.currentValue -
    fdValue
  ).toFixed(0)}
</span>

          </p>

        </div>

        <div className="bg-slate-900 p-6 rounded-xl">

          <h2 className="text-xl font-bold mb-4">
            📊 Portfolio Health
          </h2>

          <p className="mb-2">
            Funds Count:
            {holdings.length}
          </p>

          <p className="mb-2">
            Diversification:
            {holdings.length >= 4
              ? "Good"
              : "Poor"}
          </p>

          <p className="mb-2">
            Risk:
            {summary.equityPercent >
            80
              ? "Moderate"
              : "Low"}
          </p>

        </div>

      </div>

    </div>

  </div>
);}
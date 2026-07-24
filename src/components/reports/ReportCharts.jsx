import {
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b"
];

export default function ReportCharts({
  history,
  summary
}) {
  const allocation = [
    {
      name: "Equity",
      value: summary.equityValue
    },
    {
      name: "Debt",
      value: summary.debtValue
    },
    {
      name: "Liquid",
      value: summary.liquidValue
    }
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: "-99999px",
        top: 0,
        width: 900,
        background: "#ffffff",
        padding: 20
      }}
    >
      {/* Portfolio Growth */}
      <div
        id="portfolio-growth-chart"
        style={{
          width: 850,
          height: 420
        }}
      >
        <ResponsiveContainer>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            {/*
              BUG FIX: history items from portfolioHistoryService.js have
              the shape { date, invested, portfolio, profit, returnPercent }.
              There is no "nav" field on these objects, so dataKey="nav"
              matched nothing and Recharts drew an empty line (just axes,
              no line) - exactly what showed up as a blank chart in the PDF.
              The correct field to plot is "portfolio".
            */}
            <Line
              dataKey="portfolio"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              /*
                BUG FIX: Recharts animates lines in over ~1.5s by default.
                Reports.jsx only waits 400ms before running html2canvas, so
                the snapshot could be taken before the line finished drawing
                — producing a blank/partial line even with the correct
                dataKey. Disabling animation makes the chart render fully
                on the first paint, so any capture timing is safe.
              */
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Allocation */}
      <div
        id="allocation-chart"
        style={{
          width: 500,
          height: 420,
          marginTop: 40
        }}
      >
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={allocation}
              dataKey="value"
              outerRadius={130}
              label
              isAnimationActive={false}
            >
              {allocation.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

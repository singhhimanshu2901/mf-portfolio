import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

// ======================================
// Hidden NAV chart for the Individual Fund PDF report.
// ======================================
// Rendered off-screen and captured with html2canvas, same pattern as
// ReportCharts.jsx uses for the portfolio-level charts. `history` items
// come from getNavHistory(schemeCode) and have the shape { date, nav }
// (confirmed against navHistoryService.js / FundNavChart.jsx).

export default function FundReportChart({ history = [] }) {
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
      <div
        id="fund-nav-report-chart"
        style={{
          width: 850,
          height: 420
        }}
      >
        <ResponsiveContainer>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line
              dataKey="nav"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

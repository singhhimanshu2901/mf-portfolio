import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function PortfolioGrowthChart({
  data
}) {

  return (
    <div className="bg-slate-900 p-6 rounded-xl">

      <h2 className="text-2xl font-bold mb-5">
        Portfolio Growth
      </h2>

      <div className="h-[350px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart
            data={data}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="month"
            />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}
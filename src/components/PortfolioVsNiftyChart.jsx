import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";

export default function PortfolioVsNiftyChart({
  data,
  portfolioValue,
  niftyValue,
  portfolioReturn
}) {


const niftyReturn =
  data.length > 1
    ? (
        (
          (
            (niftyValue || data[data.length - 1].nifty) -
            (data[0].nifty || niftyValue)
          ) /
          (data[0].nifty || niftyValue)
        ) * 100
      ).toFixed(2)
    : 0;
  const difference =
    (
      Number(portfolioReturn) -
      Number(niftyReturn)
    ).toFixed(2);

  return (
    <div className="bg-slate-900 rounded-xl p-6">

      <h2 className="text-2xl font-bold mb-6">
        Portfolio vs NIFTY 50
      </h2>

      <div className="relative mb-8">

        <div className="grid grid-cols-2 gap-6">

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">

            <p className="text-blue-400 text-sm font-medium">
              My Portfolio
            </p>

            <p
  className={`text-3xl font-bold mt-2 ${
    Number(portfolioReturn) >= 0
      ? "text-green-400"
      : "text-red-400"
  }`}
>
  {Number(portfolioReturn).toFixed(2)}%
</p>

            <p className="text-gray-300 mt-2 text-lg">
              ₹{
                Number(
                  portfolioValue ||
                  data[data.length - 1]?.portfolio
                ).toLocaleString(
                  "en-IN"
                )
              }
            </p>

          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">

            <p className="text-orange-400 text-sm font-medium">
              NIFTY 50
            </p>

            <p
  className={`text-3xl font-bold mt-2 ${
    Number(niftyReturn) >= 0
      ? "text-green-400"
      : "text-red-400"
  }`}
>
  {Number(niftyReturn).toFixed(2)}%
</p>

            <p className="text-gray-300 mt-2 text-lg">
              ₹{
                Number(
                  niftyValue ||
                  data[data.length - 1]?.nifty
                ).toLocaleString(
                  "en-IN"
                )
              }
            </p>

          </div>

        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">

          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold shadow-lg">
            VS
          </div>

        </div>

      </div>

      <div className="flex justify-center mb-8">

        <div
          className={`px-5 py-2 rounded-full text-sm font-semibold ${
            difference >= 0
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >

          {difference >= 0
            ? `Portfolio beats NIFTY by ${difference}%`
            : `NIFTY beats Portfolio by ${Math.abs(
                difference
              )}%`}

        </div>

      </div>

      <div
        className="mt-8 w-full"
        style={{
          height: "350px",
          minHeight: "350px"
        }}
      >

        <ResponsiveContainer
          width="99%"
          height={350}
        >

          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 10
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
  dataKey="month"
  minTickGap={30}
/>

            <YAxis />

            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString(
                  "en-IN"
                ),
                "Value"
              ]}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="portfolio"
              name="Portfolio"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 8
              }}
            />

            <Line
              type="monotone"
              dataKey="nifty"
              name="NIFTY 50"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 8
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}
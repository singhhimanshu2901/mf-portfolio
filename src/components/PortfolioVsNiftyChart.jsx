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
    <div className="bg-[var(--bg-surface)] rounded-xl p-6">

      <h2 className="font-display text-2xl mb-6">
        Portfolio vs NIFTY 50
      </h2>

      <div className="relative mb-8">

        <div className="grid grid-cols-2 gap-6">

          <div
            className="rounded-2xl p-5 border"
            style={{ background: "var(--accent-soft)", borderColor: "var(--accent)" }}
          >

            <p className="text-[var(--accent)] text-sm font-medium">
              My Portfolio
            </p>

            <p
  className="font-display text-3xl mt-2"
  style={{
    color: Number(portfolioReturn) >= 0 ? "var(--gain)" : "var(--loss)"
  }}
>
  {Number(portfolioReturn).toFixed(2)}%
</p>

            <p className="text-[var(--text-secondary)] mt-2 text-lg">
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

          <div
            className="rounded-2xl p-5 border"
            style={{ background: "#7C93C71a", borderColor: "#7C93C7" }}
          >

            <p className="text-[#7C93C7] text-sm font-medium">
              NIFTY 50
            </p>

            <p
  className="font-display text-3xl mt-2"
  style={{
    color: Number(niftyReturn) >= 0 ? "var(--gain)" : "var(--loss)"
  }}
>
  {Number(niftyReturn).toFixed(2)}%
</p>

            <p className="text-[var(--text-secondary)] mt-2 text-lg">
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

          <div className="w-14 h-14 rounded-full bg-[var(--bg-surface-2)] border border-[var(--border-color-strong)] flex items-center justify-center font-bold shadow-lg">
            VS
          </div>

        </div>

      </div>

      <div className="flex justify-center mb-8">

        <div
          className="px-5 py-2 rounded-full text-sm font-semibold border"
          style={{
            background: difference >= 0 ? "#2f8f5e1a" : "#c1503d1a",
            color: difference >= 0 ? "var(--gain)" : "var(--loss)",
            borderColor: difference >= 0 ? "var(--gain)" : "var(--loss)"
          }}
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
              stroke="var(--accent)"
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
              stroke="#7C93C7"
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
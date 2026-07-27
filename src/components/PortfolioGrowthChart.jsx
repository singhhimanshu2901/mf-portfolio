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
  data = []
}) {

  return (

    <div className="bg-[var(--bg-surface)] rounded-xl p-6">

      <h2 className="text-2xl font-bold mb-5">
        My Portfolio
      </h2>

      <div
        className="w-full"
        style={{
          height: "350px",
          minHeight: "350px"
        }}
      >

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 20,
              bottom: 10
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />

            <XAxis
              dataKey="date"
              minTickGap={40}
              tick={{
                fill: "#CBD5E1",
                fontSize: 11
              }}
              tickFormatter={(value) => {

                const d =
                  new Date(value);

                return `${d.getDate()}/${d.getMonth() + 1}`;

              }}
            />

            <YAxis
              width={80}
              tick={{
                fill: "#CBD5E1",
                fontSize: 11
              }}
              tickFormatter={(value) =>
                `₹${Math.round(
                  value
                ).toLocaleString(
                  "en-IN"
                )}`
              }
            />

            <Tooltip
              content={({
                active,
                payload
              }) => {

                if (
                  active &&
                  payload &&
                  payload.length
                ) {

                  const item =
                    payload[0].payload;

                  return (

                    <div className="bg-[var(--bg-surface-2)] border border-[var(--border-color-strong)] rounded-lg p-4 shadow-xl">

                      <p className="text-[var(--text-secondary)] mb-2">

                        {new Date(
                          item.date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }
                        )}

                      </p>

                      <p className="text-blue-400 text-sm">
                        Portfolio Value
                      </p>

                      <p className="text-[var(--text-primary)] text-lg font-bold">

                        ₹{
                          Number(
                            item.portfolio
                          ).toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2
                            }
                          )
                        }

                      </p>

                      <div className="mt-3 border-t border-[var(--border-color-strong)] pt-2">

                        <p className="text-[var(--text-secondary)] text-sm">
                          Invested
                        </p>

                        <p className="text-[var(--text-primary)]">

                          ₹{
                            Number(
                              item.invested
                            ).toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 2
                              }
                            )
                          }

                        </p>

                      </div>

                      <div className="mt-2">

                        <p className="text-[var(--text-secondary)] text-sm">
                          Return
                        </p>

                        <p
                          className={`font-semibold ${
                            item.returnPercent >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >

                          {item.returnPercent}%

                        </p>

                      </div>

                    </div>

                  );

                }

                return null;

              }}
            />

            <Line
              type="monotone"
              dataKey="portfolio"
              connectNulls
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 7
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}
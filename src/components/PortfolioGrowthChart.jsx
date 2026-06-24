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
          width="99%"
          height={350}
        >

          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 10
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="point"
            />

            <YAxis
              width={80}
              tickFormatter={(value) =>
                `₹${Number(
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
                    payload[0];

                  return (
                    <div className="bg-white text-black p-3 rounded-lg shadow-lg border">

                      <p className="font-semibold mb-1">
                        📅 {
                          item.payload
                            .date
                        }
                      </p>

                      <p className="text-blue-600 font-semibold">
                        Portfolio Value
                      </p>

                      <p>
                        ₹{
                          Number(
                            item.value
                          ).toLocaleString(
                            "en-IN"
                          )
                        }
                      </p>

                    </div>
                  );
                }

                return null;
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
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
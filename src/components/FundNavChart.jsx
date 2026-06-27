// src/components/FundNavChart.jsx

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot
} from "recharts";

export default function FundNavChart({

  data = []

}) {

  if (!data.length) {

    return (

      <div className="h-[420px] flex items-center justify-center text-slate-400">

        No NAV History Available

      </div>

    );

  }

  const formatted =

    data.map(item => ({

      ...item,

      label:

        new Date(item.date)

          .toLocaleDateString(

            "en-IN",

            {

              day: "2-digit",

              month: "short"

            }

          )

    }));

  const latest =

    formatted[
      formatted.length - 1
    ];

  const highest =

    formatted.reduce(

      (a, b) =>

        a.nav > b.nav

          ? a

          : b

    );

  const lowest =

    formatted.reduce(

      (a, b) =>

        a.nav < b.nav

          ? a

          : b

    );

  const positive =

    latest.nav >=

    formatted[0].nav;

  return (

    <div className="h-[430px]">

      <ResponsiveContainer>

        <AreaChart

          data={formatted}

          margin={{

            top: 15,

            right: 30,

            left: 10,

            bottom: 5

          }}

        >

          <defs>

            <linearGradient

              id="navFill"

              x1="0"

              y1="0"

              x2="0"

              y2="1"

            >

              <stop

                offset="0%"

                stopColor={

                  positive

                    ? "#22c55e"

                    : "#ef4444"

                }

                stopOpacity={0.45}

              />

              <stop

                offset="100%"

                stopColor={

                  positive

                    ? "#22c55e"

                    : "#ef4444"

                }

                stopOpacity={0}

              />

            </linearGradient>

          </defs>

          <CartesianGrid

            strokeDasharray="3 3"

            stroke="#1e293b"

          />

          <XAxis

            dataKey="label"

            tick={{

              fill: "#94a3b8"

            }}

          />

          <YAxis

            domain={["auto", "auto"]}

            tick={{

              fill: "#94a3b8"

            }}

          />

          <Tooltip

            formatter={value => [

              `₹${Number(

                value

              ).toFixed(2)}`,

              "NAV"

            ]}

          />

          <Area

            type="monotone"

            dataKey="nav"

            stroke={

              positive

                ? "#22c55e"

                : "#ef4444"

            }

            strokeWidth={3}

            fill="url(#navFill)"

          />

          <ReferenceDot

            x={highest.label}

            y={highest.nav}

            r={6}

            label="High"

          />

          <ReferenceDot

            x={lowest.label}

            y={lowest.nav}

            r={6}

            label="Low"

          />

          <ReferenceDot

            x={latest.label}

            y={latest.nav}

            r={7}

            label="Current"

          />

        </AreaChart>

      </ResponsiveContainer>

    </div>

  );

}
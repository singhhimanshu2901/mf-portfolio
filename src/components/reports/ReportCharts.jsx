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

          <LineChart

            data={history}

          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis

              dataKey="date"

            />

            <YAxis />

            <Tooltip />

            <Line

              dataKey="nav"

              stroke="#2563eb"

              strokeWidth={3}

              dot={false}

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

            >

              {

                allocation.map(

                  (

                    entry,

                    index

                  ) => (

                    <Cell

                      key={index}

                      fill={

                        COLORS[index]

                      }

                    />

                  )

                )

              }

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}
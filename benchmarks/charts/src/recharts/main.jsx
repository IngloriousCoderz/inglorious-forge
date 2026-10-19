import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { runBenchmark } from "../shared/harness.js"
import {
  AREA_OPACITY,
  CHART_HEIGHT,
  CHART_WIDTH,
  createWorkload,
  GRID_COLOR,
  GRID_DASHARRAY,
  PIE_COLORS,
  PIE_RADIUS,
  SERIES_COLOR,
  STROKE_WIDTH,
} from "../shared/workload.js"

// Set up to draw what Inglorious Charts draws: straight segments without dots,
// the same colors, widths and labels. Animations are off: Inglorious Charts
// does not animate, so they would only make Recharts do more on each update.

const workload = createWorkload()

const size = { width: CHART_WIDTH, height: CHART_HEIGHT }

function Axes() {
  return [
    <CartesianGrid
      key="grid"
      stroke={GRID_COLOR}
      strokeDasharray={GRID_DASHARRAY}
    />,
    <XAxis key="x" dataKey="name" />,
    <YAxis key="y" />,
    <Tooltip key="tooltip" />,
  ]
}

function App() {
  const [datasets, setDatasets] = useState(workload.initial)

  useEffect(() => runBenchmark(setDatasets, workload), [])

  return (
    <div className="benchmark-container">
      <h1 className="title">Recharts</h1>
      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-title">Line Chart</div>
          <LineChart {...size} data={datasets.line}>
            {Axes()}
            <Line
              type="linear"
              dataKey="value"
              stroke={SERIES_COLOR}
              strokeWidth={STROKE_WIDTH}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </div>
        <div className="chart-container">
          <div className="chart-title">Area Chart</div>
          <AreaChart {...size} data={datasets.area}>
            {Axes()}
            <Area
              type="linear"
              dataKey="value"
              stroke={SERIES_COLOR}
              fill={SERIES_COLOR}
              fillOpacity={AREA_OPACITY}
              strokeWidth={STROKE_WIDTH}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </div>
        <div className="chart-container">
          <div className="chart-title">Bar Chart</div>
          <BarChart {...size} data={datasets.bar}>
            {Axes()}
            <Bar
              dataKey="value"
              fill={SERIES_COLOR}
              isAnimationActive={false}
            />
          </BarChart>
        </div>
        <div className="chart-container">
          <div className="chart-title">Pie Chart</div>
          <PieChart {...size}>
            <Pie
              data={datasets.pie}
              dataKey="value"
              nameKey="name"
              outerRadius={PIE_RADIUS}
              label={({ name, percent }) =>
                `${name} ${Math.round(percent * 100)}%`
              }
              isAnimationActive={false}
            >
              {datasets.pie.map((slice, index) => (
                <Cell
                  key={slice.name}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")).render(<App />)

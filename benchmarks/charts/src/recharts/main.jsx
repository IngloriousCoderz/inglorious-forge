import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { generateChartData, updateChartData } from "../utils.js"

function App() {
  const [lineData, setLineData] = useState(generateChartData())
  const [areaData, setAreaData] = useState(generateChartData())
  const [barData, setBarData] = useState(generateChartData())
  const [pieData, setPieData] = useState(
    generateChartData(10).map((d) => ({
      name: d.name,
      value: d.value,
    })),
  )
  const [fps, setFps] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLineData((prev) => updateChartData(prev))
      setAreaData((prev) => updateChartData(prev))
      setBarData((prev) => updateChartData(prev))
      setPieData((prev) =>
        updateChartData(
          prev.map((d) => ({
            name: d.name,
            value: d.value,
          })),
        ).map((d) => ({
          name: d.name,
          value: d.value,
        })),
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let lastDisplayedFps = 0

    const countFPS = () => {
      frameCount++
      const now = performance.now()

      if (now >= lastTime + 1000) {
        const newFps = Math.round((frameCount * 1000) / (now - lastTime))
        frameCount = 0
        lastTime = now

        // Only trigger re-render if FPS changed significantly (avoid unnecessary renders)
        // This matches the optimization in Inglorious Charts benchmarks
        if (Math.abs(newFps - lastDisplayedFps) >= 1) {
          setFps(newFps)
          lastDisplayedFps = newFps
        }
      }

      requestAnimationFrame(countFPS)
    }

    const rafId = requestAnimationFrame(countFPS)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="benchmark-container">
      <div className="header">
        <h1 className="title">Recharts</h1>
        <div className="metrics">
          <div
            className={`metric fps ${
              fps < 30 ? "error" : fps < 60 ? "warning" : ""
            }`}
          >
            FPS: {fps}
          </div>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-title">Line Chart</div>
          <LineChart width={400} height={300} data={lineData}>
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              dot={{ r: 3 }}
            />
          </LineChart>
        </div>
        <div className="chart-container">
          <div className="chart-title">Area Chart</div>
          <AreaChart width={400} height={300} data={areaData}>
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
              dot={{ r: 3 }}
            />
          </AreaChart>
        </div>
        <div className="chart-container">
          <div className="chart-title">Bar Chart</div>
          <BarChart width={400} height={300} data={barData}>
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
        <div className="chart-container">
          <div className="chart-title">Pie Chart</div>
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
            />
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

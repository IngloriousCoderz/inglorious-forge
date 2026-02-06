import { useEffect, useState } from "react"

import {
  generateData,
  MAX_VALUE,
  ROWS_TO_GENERATE,
  ROWS_TO_UPDATE,
  UPDATE_FREQUENCY,
  updateData,
} from "../data"
import { Chart } from "./chart"
import { MetricsDisplay } from "./metrics"
import { Table } from "./table"

const SAME = 0
const RESET = 0
const ONE_SECOND = 1000

export default function Dashboard() {
  const [data, setData] = useState(() => generateData(ROWS_TO_GENERATE))
  const [filter, setFilter] = useState("")
  const [sortBy, setSortBy] = useState("id")
  const [metrics, setMetrics] = useState({
    fps: 60,
    renderTime: 0,
    updateCount: 0,
  })

  // FPS Counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const countFPS = () => {
      frameCount++
      const now = performance.now()

      if (now >= lastTime + ONE_SECOND) {
        const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
        setMetrics((prev) => ({ ...prev, fps }))
        frameCount = RESET
        lastTime = now
      }

      requestAnimationFrame(countFPS)
    }

    const rafId = requestAnimationFrame(countFPS)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const start = performance.now()

      setData((prev) => updateData(prev, ROWS_TO_UPDATE))

      const end = performance.now()
      setMetrics((prev) => ({
        ...prev,
        renderTime: Math.round(end - start),
        updateCount: prev.updateCount + 1,
      }))
    }, UPDATE_FREQUENCY)

    return () => clearInterval(interval)
  }, [])

  // Filter and sort data
  const filteredData = data
    .filter(
      (row) =>
        row.name.toLowerCase().includes(filter.toLowerCase()) ||
        row.status.toLowerCase().includes(filter.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "id") return a.id - b.id
      if (sortBy === "value") return b.value - a.value
      if (sortBy === "progress") return b.progress - a.progress
      return SAME
    })

  const handleRowClick = (id) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, value: Math.floor(Math.random() * MAX_VALUE) }
          : row,
      ),
    )
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleSortById = () => setSortBy("id")
  const handleSortByValue = () => setSortBy("value")
  const handleSortByProgress = () => setSortBy("progress")

  const chartData1 = filteredData.slice(0, 20)
  const chartData2 = filteredData.slice(20, 40)
  const chartData3 = filteredData.slice(40, 60)
  const chartData4 = filteredData.slice(60, 80)

  return (
    <div className="dashboard">
      <div className="header">
        <div className="title">🐌 REACT (NAIVE) BENCHMARK</div>
        <MetricsDisplay metrics={metrics} />
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Filter by name or status..."
          value={filter}
          onChange={handleFilterChange}
        />
        <select value={sortBy} onChange={handleSortChange}>
          <option value="id">Sort by ID</option>
          <option value="value">Sort by Value</option>
          <option value="progress">Sort by Progress</option>
        </select>
      </div>

      <div className="charts">
        <Chart data={chartData1} type="bar" title="Progress Overview" />
        <Chart data={chartData2} type="bar" title="Value Distribution" />
        <Chart data={chartData3} type="bar" title="Live Updates" />
        <Chart data={chartData4} type="bar" title="Status Breakdown" />
      </div>

      <div className="table-container">
        <Table
          data={filteredData}
          onSortById={handleSortById}
          onSortByValue={handleSortByValue}
          onSortByProgress={handleSortByProgress}
          onRowClick={handleRowClick}
        />
      </div>

      <div className="info">
        ⚠️ NAIVE IMPLEMENTATION: No memoization, no optimization. Every state
        change re-renders everything. Watch the FPS drop as the app struggles
        with updates.
      </div>
    </div>
  )
}

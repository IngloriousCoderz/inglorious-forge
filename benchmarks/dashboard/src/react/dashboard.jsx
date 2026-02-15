import { useEffect, useState } from "react"

import { CHARTS } from "../charts"
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
const NEXT_UPDATE = 1

export default function Dashboard() {
  const [tableData, setTableData] = useState(() =>
    generateData(ROWS_TO_GENERATE),
  )
  const [charts] = useState(CHARTS)
  const [metrics, setMetrics] = useState({
    fps: 60,
    renderTime: 0,
    updateCount: 0,
    filter: "",
    sortBy: "id",
  })

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

  useEffect(() => {
    const interval = setInterval(() => {
      const start = performance.now()

      setTableData((prev) => updateData(prev, ROWS_TO_UPDATE))

      const end = performance.now()
      setMetrics((prev) => ({
        ...prev,
        updateCount: prev.updateCount + NEXT_UPDATE,
        renderTime: Math.round(end - start),
      }))
    }, UPDATE_FREQUENCY)

    return () => clearInterval(interval)
  }, [])

  const filteredRows = tableData
    .filter(
      (row) =>
        row.name.toLowerCase().includes(metrics.filter.toLowerCase()) ||
        row.status.toLowerCase().includes(metrics.filter.toLowerCase()),
    )
    .sort((a, b) => {
      if (metrics.sortBy === "id") return a.id - b.id
      if (metrics.sortBy === "value") return b.value - a.value
      if (metrics.sortBy === "progress") return b.progress - a.progress
      return SAME
    })

  const handleTableClick = (id) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, value: Math.floor(Math.random() * MAX_VALUE) }
          : row,
      ),
    )
  }

  const handleFilterChange = (e) => {
    setMetrics((prev) => ({ ...prev, filter: e.target.value }))
  }

  const handleSortChange = (e) => {
    setMetrics((prev) => ({ ...prev, sortBy: e.target.value }))
  }

  const handleSortById = () => setMetrics((prev) => ({ ...prev, sortBy: "id" }))
  const handleSortByValue = () =>
    setMetrics((prev) => ({ ...prev, sortBy: "value" }))
  const handleSortByProgress = () =>
    setMetrics((prev) => ({ ...prev, sortBy: "progress" }))

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
          value={metrics.filter}
          onChange={handleFilterChange}
        />
        <select value={metrics.sortBy} onChange={handleSortChange}>
          <option value="id">Sort by ID</option>
          <option value="value">Sort by Value</option>
          <option value="progress">Sort by Progress</option>
        </select>
      </div>

      <div className="charts">
        {Object.values(charts).map((chart) => {
          const chartRows = filteredRows.slice(chart.rangeStart, chart.rangeEnd)
          return <Chart key={chart.id} data={chartRows} title={chart.title} />
        })}
      </div>

      <div className="table-container">
        <Table
          data={filteredRows}
          onSortById={handleSortById}
          onSortByValue={handleSortByValue}
          onSortByProgress={handleSortByProgress}
          onRowClick={handleTableClick}
        />
      </div>

      <div className="info">
        ⚠️ NAIVE IMPLEMENTATION: Same business model as the other variants, but
        without memoization or selector optimization.
      </div>
    </div>
  )
}

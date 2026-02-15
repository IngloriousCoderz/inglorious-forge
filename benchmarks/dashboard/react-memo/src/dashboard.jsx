import { useCallback, useEffect, useMemo, useState } from "react"

import { CHARTS } from "@benchmarks/dashboard-shared"
import {
  applyFpsSample,
  createFpsBenchmark,
  generateData,
  MAX_VALUE,
  ROWS_TO_GENERATE,
  ROWS_TO_UPDATE,
  UPDATE_FREQUENCY,
  updateData,
} from "@benchmarks/dashboard-shared"
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
    fpsNow: 60,
    fpsSamples: [60],
    benchmark: createFpsBenchmark(),
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
        setMetrics((prev) => applyFpsSample(prev, fps))
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

  const filteredRows = useMemo(() => {
    const normalizedFilter = metrics.filter.toLowerCase()

    return tableData
      .filter(
        (row) =>
          row.name.toLowerCase().includes(normalizedFilter) ||
          row.status.toLowerCase().includes(normalizedFilter),
      )
      .sort((a, b) => {
        if (metrics.sortBy === "id") return a.id - b.id
        if (metrics.sortBy === "value") return b.value - a.value
        if (metrics.sortBy === "progress") return b.progress - a.progress
        return SAME
      })
  }, [tableData, metrics.filter, metrics.sortBy])

  const handleTableClick = useCallback((id) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, value: Math.floor(Math.random() * MAX_VALUE) }
          : row,
      ),
    )
  }, [])

  const handleFilterChange = useCallback((e) => {
    setMetrics((prev) => ({ ...prev, filter: e.target.value }))
  }, [])

  const handleSortChange = useCallback((e) => {
    setMetrics((prev) => ({ ...prev, sortBy: e.target.value }))
  }, [])

  const handleSortById = useCallback(
    () => setMetrics((prev) => ({ ...prev, sortBy: "id" })),
    [],
  )
  const handleSortByValue = useCallback(
    () => setMetrics((prev) => ({ ...prev, sortBy: "value" })),
    [],
  )
  const handleSortByProgress = useCallback(
    () => setMetrics((prev) => ({ ...prev, sortBy: "progress" })),
    [],
  )

  const chartRows = useMemo(() => {
    return Object.values(charts).reduce((acc, chart) => {
      acc[chart.id] = filteredRows.slice(chart.rangeStart, chart.rangeEnd)
      return acc
    }, {})
  }, [charts, filteredRows])

  return (
    <div className="dashboard">
      <div className="header">
        <div className="title">🏃 REACT (OPTIMIZED) BENCHMARK</div>
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
        {Object.values(charts).map((chart) => (
          <Chart
            key={chart.id}
            data={chartRows[chart.id]}
            title={chart.title}
          />
        ))}
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
        ✅ OPTIMIZED IMPLEMENTATION: Same business model as other variants, with
        React memoization (`memo`, `useMemo`, `useCallback`).
      </div>
    </div>
  )
}

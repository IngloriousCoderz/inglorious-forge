import { useCallback, useEffect, useMemo, useState } from "react"

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

  // Memoized filter and sort
  const filteredData = useMemo(() => {
    return data
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
  }, [data, filter, sortBy])

  // Memoized callback for row clicks
  const handleRowClick = useCallback((id) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, value: Math.floor(Math.random() * MAX_VALUE) }
          : row,
      ),
    )
  }, [])

  // Memoized callbacks for controls
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value)
  }, [])

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value)
  }, [])

  const handleSortById = useCallback(() => setSortBy("id"), [])
  const handleSortByValue = useCallback(() => setSortBy("value"), [])
  const handleSortByProgress = useCallback(() => setSortBy("progress"), [])

  // Memoized chart data slices
  const chartData1 = useMemo(() => filteredData.slice(0, 20), [filteredData])
  const chartData2 = useMemo(() => filteredData.slice(20, 40), [filteredData])
  const chartData3 = useMemo(() => filteredData.slice(40, 60), [filteredData])
  const chartData4 = useMemo(() => filteredData.slice(60, 80), [filteredData])

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
        <Chart data={chartData1} type="bar" title="Value Distribution" />
        <Chart data={chartData2} type="bar" title="Progress Overview" />
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
        ✅ OPTIMIZED IMPLEMENTATION: React.memo, useMemo, useCallback
        everywhere. Better performance, but look at all that boilerplate! Every
        optimization requires mental overhead.
      </div>
    </div>
  )
}

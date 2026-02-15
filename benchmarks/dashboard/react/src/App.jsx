import { useEffect } from "react"

import {
  CHARTS,
  getChartData,
  UPDATE_FREQUENCY,
} from "@benchmarks/dashboard-shared"

import { Chart } from "./components/Chart"
import { DataTable } from "./components/DataTable"
import { MetricsDisplay } from "./components/MetricsDisplay"
import { useDashboardState } from "./store/useDashboardState"

const RESET = 0
const ONE_SECOND = 1000

export function App() {
  const { state, filteredRows, notify, Events } = useDashboardState()

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const countFPS = () => {
      frameCount++
      const now = performance.now()

      if (now >= lastTime + ONE_SECOND) {
        const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
        notify(Events.METRICS_SET_FPS, fps)
        frameCount = RESET
        lastTime = now
      }

      requestAnimationFrame(countFPS)
    }

    const rafId = requestAnimationFrame(countFPS)
    return () => cancelAnimationFrame(rafId)
  }, [Events.METRICS_SET_FPS, notify])

  useEffect(() => {
    const interval = setInterval(() => {
      notify(Events.RANDOM_UPDATE)
    }, UPDATE_FREQUENCY)

    return () => clearInterval(interval)
  }, [Events.RANDOM_UPDATE, notify])

  return (
    <div className="dashboard">
      <div className="header">
        <div className="title">🐌 REACT BENCHMARK</div>
        <MetricsDisplay metrics={state.metrics} />
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Filter by name or status..."
          value={state.metrics.filter}
          onChange={(e) => notify(Events.METRICS_SET_FILTER, e.target.value)}
        />
        <select
          value={state.metrics.sortBy}
          onChange={(e) => notify(Events.METRICS_SET_SORT, e.target.value)}
        >
          <option value="id">Sort by ID</option>
          <option value="value">Sort by Value</option>
          <option value="progress">Sort by Progress</option>
        </select>
      </div>

      <div className="charts">
        {Object.values(CHARTS).map((chart) => (
          <Chart key={chart.id} chartData={getChartData(filteredRows, chart)} />
        ))}
      </div>

      <DataTable
        rows={filteredRows}
        onSort={(value) => notify(Events.METRICS_SET_SORT, value)}
        onRowClick={(id) => notify(Events.TABLE_CLICK, id)}
      />

      <div className="info">
        React baseline benchmark with same UI component shape as Inglorious:
        dashboard, metrics, chart, table, row.
      </div>
    </div>
  )
}

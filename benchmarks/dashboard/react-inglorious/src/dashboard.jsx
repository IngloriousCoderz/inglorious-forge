import { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { CHARTS } from "@benchmarks/dashboard-shared"
import { UPDATE_FREQUENCY } from "@benchmarks/dashboard-shared"
import { Chart } from "./chart"
import { MetricsDisplay } from "./metrics"
import { setFilter, setFPS, setSort } from "./store/metrics.slice"
import { selectFilter, selectSortBy } from "./store/selectors"
import { Table } from "./table"

const RESET = 0
const ONE_SECOND = 1000

export default function Dashboard() {
  const dispatch = useDispatch()

  const filter = useSelector(selectFilter)
  const sortBy = useSelector(selectSortBy)

  // FPS Counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const countFPS = () => {
      frameCount++
      const now = performance.now()

      if (now >= lastTime + ONE_SECOND) {
        const fps = Math.round((frameCount * ONE_SECOND) / (now - lastTime))
        dispatch(setFPS(fps))
        frameCount = RESET
        lastTime = now
      }

      requestAnimationFrame(countFPS)
    }

    const rafId = requestAnimationFrame(countFPS)
    return () => cancelAnimationFrame(rafId)
  }, [dispatch])

  // Live data updates (single event, like the inglorious variant)
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "randomUpdate" })
    }, UPDATE_FREQUENCY)

    return () => clearInterval(interval)
  }, [dispatch])

  const handleFilterChange = useCallback(
    (e) => {
      dispatch(setFilter(e.target.value))
    },
    [dispatch],
  )

  const handleSortChange = useCallback(
    (e) => {
      dispatch(setSort(e.target.value))
    },
    [dispatch],
  )

  return (
    <div className="dashboard">
      <div className="header">
        <div className="title">⚛️ REACT + INGLORIOUS STORE BENCHMARK</div>
        <MetricsDisplay />
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
        {Object.keys(CHARTS).map((chartId) => (
          <Chart key={chartId} chartId={chartId} />
        ))}
      </div>

      <div className="table-container">
        <Table />
      </div>

      <div className="info">
        ✅ React + native Inglorious Store baseline (no component memoization).
      </div>
    </div>
  )
}

import { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { UPDATE_FREQUENCY } from "../data"
import { Chart } from "./chart"
import { MetricsDisplay } from "./metrics"
import { setFilter, setSort, updateRandomRows } from "./store/data.slice"
import { incrementUpdate, setFPS, setRenderTime } from "./store/metrics.slice"
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
  }, [])

  // Live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const start = performance.now()

      dispatch(updateRandomRows())
      dispatch(incrementUpdate())

      const end = performance.now()
      dispatch(setRenderTime(Math.round(end - start)))
    }, UPDATE_FREQUENCY)

    return () => clearInterval(interval)
  }, [])

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
        <div className="title">🧩 REACT + RTK + INGLORIOUS STORE BENCHMARK</div>
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
        <Chart
          rangeStart={0}
          rangeEnd={20}
          type="bar"
          title="Progress Overview"
        />
        <Chart
          rangeStart={20}
          rangeEnd={40}
          type="bar"
          title="Value Distribution"
        />
        <Chart rangeStart={40} rangeEnd={60} type="bar" title="Live Updates" />
        <Chart
          rangeStart={60}
          rangeEnd={80}
          type="bar"
          title="Status Breakdown"
        />
      </div>

      <div className="table-container">
        <Table />
      </div>

      <div className="info">
        ✅ RTK slices are converted via migration adapters and run on Inglorious
        Store while keeping the same React + react-redux component flow.
      </div>
    </div>
  )
}

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
        <div className="title">🐢 REACT + RTK (OPTIMIZED) BENCHMARK</div>
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
        <Chart start={0} end={20} type="bar" title="Progress Overview" />
        <Chart start={20} end={40} type="bar" title="Value Distribution" />
        <Chart start={40} end={60} type="bar" title="Live Updates" />
        <Chart start={60} end={80} type="bar" title="Status Breakdown" />
      </div>

      <div className="table-container">
        <Table />
      </div>

      <div className="info">
        ✅ RTK + OPTIMIZED: createSelector, React.memo, useMemo, useCallback
        everywhere. Look at all this boilerplate just to match Inglorious&apos;s
        default behavior!
      </div>
    </div>
  )
}

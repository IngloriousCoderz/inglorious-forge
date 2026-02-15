import { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { UPDATE_FREQUENCY } from "../data"
import { Chart } from "./chart"
import { MetricsDisplay } from "./metrics"
import { randomUpdate } from "./store/data.slice"
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
      dispatch(randomUpdate())
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
        <Chart chartId="chart1" />
        <Chart chartId="chart2" />
        <Chart chartId="chart3" />
        <Chart chartId="chart4" />
      </div>

      <div className="table-container">
        <Table />
      </div>

      <div className="info">
        ✅ React components on top of native Inglorious Store types and
        selectors, without RTK slices or adapters.
      </div>
    </div>
  )
}

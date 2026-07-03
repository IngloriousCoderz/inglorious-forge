import { createMemo, createSignal } from "solid-js"

import {
  Events,
  applyFpsSample,
  createInitialState,
  filterAndSortRows,
  ROWS_TO_UPDATE,
  MAX_VALUE,
} from "@benchmarks/dashboard-shared"

export const useDashboardState = () => {
  const initial = createInitialState()

  // metrics signals
  const [fps, setFps] = createSignal(initial.metrics.fps)
  const [fpsNow, setFpsNow] = createSignal(initial.metrics.fpsNow)
  const [fpsSamples, setFpsSamples] = createSignal(initial.metrics.fpsSamples)
  const [benchmark, setBenchmark] = createSignal(initial.metrics.benchmark)
  const [renderTime, setRenderTime] = createSignal(initial.metrics.renderTime)
  const [updateCount, setUpdateCount] = createSignal(
    initial.metrics.updateCount,
  )
  const [filter, setFilter] = createSignal(initial.metrics.filter)
  const [sortBy, setSortBy] = createSignal(initial.metrics.sortBy)

  // table rows represented as objects with accessor properties that read signals
  const rowSetters = new Map()
  const rows = initial.table.data.map((r) => {
    const [valueSig, setValueSig] = createSignal(r.value)
    const [progressSig, setProgressSig] = createSignal(r.progress)
    const [timestampSig, setTimestampSig] = createSignal(r.timestamp)

    rowSetters.set(r.id, { setValueSig, setProgressSig, setTimestampSig })

    return {
      id: r.id,
      rowId: r.rowId,
      name: r.name,
      status: r.status,
      get value() {
        return valueSig()
      },
      get progress() {
        return progressSig()
      },
      get timestamp() {
        return timestampSig()
      },
    }
  })

  const filteredRows = createMemo(() =>
    filterAndSortRows(rows, filter(), sortBy()),
  )

  const notify = (type, payload) => {
    const start = performance.now()

    switch (type) {
      case Events.METRICS_SET_FPS: {
        const nextMetrics = applyFpsSample(
          {
            fps: fps(),
            fpsNow: fpsNow(),
            fpsSamples: fpsSamples(),
            benchmark: benchmark(),
            renderTime: renderTime(),
            updateCount: updateCount(),
            filter: filter(),
            sortBy: sortBy(),
          },
          payload,
        )

        setFps(nextMetrics.fps)
        setFpsNow(nextMetrics.fpsNow)
        setFpsSamples(nextMetrics.fpsSamples)
        setBenchmark(nextMetrics.benchmark)
        break
      }
      case Events.METRICS_SET_FILTER: {
        setFilter(payload)
        break
      }
      case Events.METRICS_SET_SORT: {
        setSortBy(payload)
        break
      }
      case Events.TABLE_CLICK: {
        const id = payload
        const setters = rowSetters.get(id)
        if (setters) {
          setters.setValueSig(Math.floor(Math.random() * MAX_VALUE))
          setters.setTimestampSig(Date.now())
        }
        break
      }
      case Events.RANDOM_UPDATE: {
        for (let i = 0; i < ROWS_TO_UPDATE; i++) {
          const randomIndex = Math.floor(Math.random() * rows.length)
          const row = rows[randomIndex]
          const setters = rowSetters.get(row.id)
          if (setters) {
            setters.setValueSig(Math.floor(Math.random() * MAX_VALUE))
            setters.setProgressSig(Math.floor(Math.random() * 100))
            setters.setTimestampSig(Date.now())
          }
        }
        setUpdateCount((c) => c + 1)
        setRenderTime(Math.round(performance.now() - start))
        break
      }
      default:
        break
    }
  }

  const state = {
    metrics: {
      get fps() {
        return fps()
      },
      get fpsNow() {
        return fpsNow()
      },
      get fpsSamples() {
        return fpsSamples()
      },
      get benchmark() {
        return benchmark()
      },
      get renderTime() {
        return renderTime()
      },
      get updateCount() {
        return updateCount()
      },
      get filter() {
        return filter()
      },
      get sortBy() {
        return sortBy()
      },
    },
    table: {
      get data() {
        return rows
      },
    },
  }

  return {
    state,
    filteredRows,
    notify,
    Events,
  }
}

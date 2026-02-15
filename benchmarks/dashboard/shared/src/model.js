import {
  applyFpsSample,
  CHARTS,
  createFpsBenchmark,
  generateData,
  MAX_VALUE,
  ROWS_TO_GENERATE,
  ROWS_TO_UPDATE,
  updateData,
} from "./core"
import { Events } from "./events"

export const createInitialState = () => ({
  metrics: {
    fps: 60,
    fpsNow: 60,
    fpsSamples: [60],
    benchmark: createFpsBenchmark(),
    renderTime: 0,
    updateCount: 0,
    filter: "",
    sortBy: "id",
  },
  table: {
    data: generateData(ROWS_TO_GENERATE),
  },
  charts: CHARTS,
})

const metricsHandlers = {
  [Events.METRICS_SET_FPS]: (metrics, payload) =>
    applyFpsSample(metrics, payload),
  [Events.METRICS_SET_FILTER]: (metrics, payload) => ({
    ...metrics,
    filter: payload,
  }),
  [Events.METRICS_SET_SORT]: (metrics, payload) => ({
    ...metrics,
    sortBy: payload,
  }),
  [Events.RANDOM_UPDATE]: (metrics) => {
    const start = performance.now()
    return {
      ...metrics,
      updateCount: metrics.updateCount + 1,
      renderTime: Math.round(performance.now() - start),
    }
  },
}

const tableHandlers = {
  [Events.TABLE_CLICK]: (table, payload) => ({
    ...table,
    data: table.data.map((row) =>
      row.id === payload
        ? { ...row, value: Math.floor(Math.random() * MAX_VALUE) }
        : row,
    ),
  }),
  [Events.RANDOM_UPDATE]: (table) => ({
    ...table,
    data: updateData(table.data, ROWS_TO_UPDATE),
  }),
}

export const applyEvent = (state, event) => {
  const { type, payload } = event

  const nextMetrics = metricsHandlers[type]
    ? metricsHandlers[type](state.metrics, payload)
    : state.metrics
  const nextTable = tableHandlers[type]
    ? tableHandlers[type](state.table, payload)
    : state.table

  if (nextMetrics === state.metrics && nextTable === state.table) {
    return state
  }

  return {
    ...state,
    metrics: nextMetrics,
    table: nextTable,
  }
}

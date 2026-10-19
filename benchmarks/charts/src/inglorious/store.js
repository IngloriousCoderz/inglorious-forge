import { Chart } from "@inglorious/charts"
import { createStore } from "@inglorious/store"

import {
  CHART_HEIGHT,
  CHART_WIDTH,
  PIE_RADIUS,
  SERIES_COLOR,
} from "../shared/workload.js"

// Every chart takes its dataset from the one event an update sends, so the page
// renders once per update, as React renders once for its batched state updates.
const BenchmarkData = {
  datasetsUpdate(entity, datasets) {
    Chart.dataUpdate(entity, datasets[entity.id])
  },
}

/**
 * The store both Inglorious variants render: one entity per chart, configured
 * as the config variant draws it. The composition variant reads their data
 * and state, and draws them from its own primitives.
 */
export function createBenchmarkStore(datasets) {
  const cartesian = {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    colors: [SERIES_COLOR],
    hasGrid: true,
    hasDots: false,
    hasTooltip: true,
  }

  return createStore({
    types: {
      Line: [Chart, BenchmarkData],
      Area: [Chart, BenchmarkData],
      Bar: [Chart, BenchmarkData],
      Pie: [Chart, BenchmarkData],
    },
    entities: {
      line: { type: "Line", data: datasets.line, ...cartesian },
      area: { type: "Area", data: datasets.area, ...cartesian },
      bar: { type: "Bar", data: datasets.bar, ...cartesian },
      pie: {
        type: "Pie",
        data: datasets.pie,
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
        nameKey: "name",
        outerRadius: PIE_RADIUS,
        hasLabel: true,
        hasTooltip: true,
      },
    },
  })
}

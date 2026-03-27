import { createStore } from "@inglorious/store"
import {
  areaChart,
  barChart,
  chart,
  composedChart,
  donutChart,
  lineChart,
  pieChart,
} from "@inglorious/charts"
import { withRealtime } from "@inglorious/charts/realtime"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

const lineRealtimeChart = withRealtime(lineChart)

export const store = createStore({
  types: {
    area: areaChart,
    line: lineChart,
    "line-rt": lineRealtimeChart,
    bar: barChart,
    composed: composedChart,
    pie: pieChart,
    donut: donutChart,
    // Add chart object for composition methods
    chart: chart,
  },
  entities,
  middlewares,
})

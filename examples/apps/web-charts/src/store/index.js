import { createStore } from "@inglorious/web"
import {
  areaChart,
  barChart,
  chart,
  createRealtimeStreamSystem,
  donutChart,
  lineChart,
  pieChart,
} from "@inglorious/charts"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

const realtimeStreamRuntime = createRealtimeStreamSystem({
  targetType: "line",
  tickEvent: "streamTick",
  minIntervalMs: 100,
  intervalMs: 100,
})

export const stopRealtimeStreamSystem = realtimeStreamRuntime.stop

export const store = createStore({
  types: {
    area: areaChart,
    line: lineChart,
    bar: barChart,
    pie: pieChart,
    donut: donutChart,
    // Add chart object for composition methods
    chart: chart,
  },
  entities,
  middlewares,
  systems: [realtimeStreamRuntime.system],
})

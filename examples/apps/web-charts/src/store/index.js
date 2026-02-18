import { createStore } from "@inglorious/web"
import {
  areaChart,
  barChart,
  chart,
  createRealtimeStreamSystem,
  donutChart,
  lineChart,
  pieChart,
  streamSlide,
} from "@inglorious/charts"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

const line = {
  ...lineChart,
  seriesSlide: streamSlide,
}

const realtimeStream = {
  streamTick(entity, _payload, api) {
    const min = Number.isFinite(entity.min) ? entity.min : 80
    const max = Number.isFinite(entity.max) ? entity.max : 420
    const variation = Number.isFinite(entity.variation) ? entity.variation : 25
    const currentValue = Number.isFinite(entity.currentValue)
      ? entity.currentValue
      : 220

    const delta = Math.round((Math.random() - 0.5) * variation * 2)
    const nextValue = Math.max(min, Math.min(max, currentValue + delta))
    entity.currentValue = nextValue

    if (!Array.isArray(entity.targets)) return

    entity.targets.forEach((targetId) => {
      api.notify(`#${targetId}:seriesSlide`, {
        value: nextValue,
        windowSize: entity.windowSize,
      })
    })
  },
}

const realtimeStreamRuntime = createRealtimeStreamSystem({
  controllerId: "realtimeStreamController",
  tickEvent: "streamTick",
  minIntervalMs: 100,
})

export const stopRealtimeStreamSystem = realtimeStreamRuntime.stop

export const store = createStore({
  types: {
    area: areaChart,
    line,
    bar: barChart,
    pie: pieChart,
    donut: donutChart,
    realtimeStream,
    // Add chart object for composition methods
    chart: chart,
  },
  entities,
  middlewares,
  systems: [realtimeStreamRuntime.system],
})

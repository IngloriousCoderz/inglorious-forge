import { createStore } from "@inglorious/web"
import { chart } from "@inglorious/charts"
import { withRealtime } from "@inglorious/charts/realtime"
import { entities } from "./entities.js"

export const store = createStore({
  types: {
    area: chart,
    bar: chart,
    line: chart,
    "area-rt": [chart, withRealtime],
    "bar-rt": [chart, withRealtime],
    "line-rt": [chart, withRealtime],
    composed: chart,
    pie: chart,
    donut: chart,
  },
  entities,
})

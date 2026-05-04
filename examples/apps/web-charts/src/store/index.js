import { createStore } from "@inglorious/store"
import { Chart } from "@inglorious/charts"
import { withRealtime } from "@inglorious/charts/realtime"
import { entities } from "./entities.js"

export const store = createStore({
  types: {
    area: Chart,
    bar: Chart,
    line: Chart,
    "area-rt": [Chart, withRealtime],
    "bar-rt": [Chart, withRealtime],
    "line-rt": [Chart, withRealtime],
    composed: Chart,
    pie: Chart,
    donut: Chart,
  },
  entities,
})

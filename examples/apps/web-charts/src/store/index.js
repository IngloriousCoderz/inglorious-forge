import { Chart } from "@inglorious/charts"
import { withRealtime } from "@inglorious/charts/realtime"
import { createStore } from "@inglorious/store"

import { entities } from "./entities.js"

export const store = createStore({
  types: {
    Area: Chart,
    Bar: Chart,
    Line: Chart,
    "Area-rt": [Chart, withRealtime],
    "Bar-rt": [Chart, withRealtime],
    "Line-rt": [Chart, withRealtime],
    Composed: Chart,
    Pie: Chart,
    Donut: Chart,
    Scatter: Chart,
    Radar: Chart,
    Radial: Chart,
  },
  entities,
})

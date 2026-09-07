import { createStore } from "@inglorious/store"
import { Chart } from "@inglorious/charts"
import { entities } from "./entities.js"

export const store = createStore({
  types: {
    Line: Chart,
    Area: Chart,
    Bar: Chart,
    Pie: Chart,
  },
  entities,
  middlewares: [],
})

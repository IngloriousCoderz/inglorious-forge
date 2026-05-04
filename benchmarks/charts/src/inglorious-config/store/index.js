import { createStore } from "@inglorious/web"
import { Chart } from "@inglorious/charts"
import { entities } from "./entities.js"

export const store = createStore({
  types: {
    line: Chart,
    area: Chart,
    bar: Chart,
    pie: Chart,
  },
  entities,
  middlewares: [],
})

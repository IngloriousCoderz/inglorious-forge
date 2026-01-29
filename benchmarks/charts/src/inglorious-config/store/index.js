import { createStore } from "@inglorious/web"
import { areaChart, barChart, lineChart, pieChart } from "@inglorious/charts"
import { entities } from "./entities.js"

export const store = createStore({
  types: {
    line: lineChart,
    area: areaChart,
    bar: barChart,
    pie: pieChart,
  },
  entities,
  middlewares: [],
})

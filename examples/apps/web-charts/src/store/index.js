import { createStore } from "@inglorious/web"
import { areaChart, barChart, donutChart, lineChart, pieChart } from "@inglorious/charts"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

export const store = createStore({
  types: {
    area: areaChart,
    line: lineChart,
    bar: barChart,
    pie: pieChart,
    donut: donutChart,
  },
  entities,
  middlewares,
})

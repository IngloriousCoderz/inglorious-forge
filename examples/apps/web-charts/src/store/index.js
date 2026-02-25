import { createStore } from "@inglorious/web"
import {
  areaChart,
  barChart,
  chart,
  donutChart,
  lineChart,
  pieChart,
} from "@inglorious/charts"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

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
})

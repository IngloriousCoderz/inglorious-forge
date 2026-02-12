import { createStore } from "@inglorious/web"
import {
  areaChart,
  barChart,
  chart,
  lineChart,
  pieChart,
} from "@inglorious/charts"
import { entities } from "./entities.js"

export const store = createStore({
  types: {
    // Add chart types so chart.renderLineChart can delegate to them
    line: lineChart,
    area: areaChart,
    bar: barChart,
    pie: pieChart,
    // Add chart object for composition methods
    chart: chart,
  },
  entities,
  middlewares: [],
})

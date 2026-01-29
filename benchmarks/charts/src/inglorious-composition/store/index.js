import { createStore } from "@inglorious/web"
import {
  areaChart,
  barChart,
  charts,
  lineChart,
  pieChart,
} from "@inglorious/charts"
import { entities } from "./entities.js"

export const store = createStore({
  types: {
    // Add chart types so charts.renderLineChart can delegate to them
    line: lineChart,
    area: areaChart,
    bar: barChart,
    pie: pieChart,
    // Add charts object for composition methods
    chart: charts,
  },
  entities,
  middlewares: [],
})

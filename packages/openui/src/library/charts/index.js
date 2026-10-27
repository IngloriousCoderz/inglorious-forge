import {
  AreaChart,
  BarChart,
  HorizontalBarChart,
  LineChart,
} from "./cartesian.js"
import { PieChart } from "./pie-chart.js"
import { RadarChart } from "./radar-chart.js"
import { RadialChart } from "./radial-chart.js"
import { Point, ScatterChart, ScatterSeries } from "./scatter-chart.js"
import { Series } from "./series.js"
import { SingleStackedBarChart } from "./single-stacked-bar-chart.js"

/**
 * The charts, to add to a library:
 * `uiLibrary.extend({ components: { add: chartComponents } })`.
 * They need `@inglorious/charts` and its stylesheets in the app.
 */
export const chartComponents = [
  BarChart,
  HorizontalBarChart,
  LineChart,
  AreaChart,
  RadarChart,
  Series,
  PieChart,
  RadialChart,
  SingleStackedBarChart,
  ScatterChart,
  ScatterSeries,
  Point,
]

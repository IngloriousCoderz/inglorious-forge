import { areaChart } from "./chart/area-chart.js"
import { barChart } from "./chart/bar-chart.js"
import { donutChart } from "./chart/donut-chart.js"
import { lineChart } from "./chart/line-chart.js"
import { pieChart } from "./chart/pie-chart.js"
import { logic } from "./logic.js"
import { registerChartType } from "./registry.js"
import { rendering } from "./rendering.js"

// Register chart types
registerChartType("area", areaChart)
registerChartType("bar", barChart)
registerChartType("donut", donutChart)
registerChartType("line", lineChart)
registerChartType("pie", pieChart)

// Export charts
export { areaChart } from "./chart/area-chart.js"
export { barChart } from "./chart/bar-chart.js"
export { donutChart } from "./chart/donut-chart.js"
export { lineChart } from "./chart/line-chart.js"
export { pieChart } from "./chart/pie-chart.js"

// Export main charts object
export const charts = {
  ...logic,
  ...rendering,
}

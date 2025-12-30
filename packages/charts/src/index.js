import { logic } from "./logic.js"
import { rendering } from "./rendering.js"

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

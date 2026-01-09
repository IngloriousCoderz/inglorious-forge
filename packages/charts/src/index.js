import { logic } from "./logic.js"
import { rendering } from "./rendering.js"

// Export charts
export {
  areaChart,
  barChart,
  donutChart,
  lineChart,
  pieChart,
} from "./utils/chart-utils.js"

// Export main charts object
export const charts = {
  ...logic,
  ...rendering,
}

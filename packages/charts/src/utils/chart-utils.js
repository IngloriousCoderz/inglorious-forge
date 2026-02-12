/**
 * Chart utilities
 * Functions for chart creation and configuration
 */

import { area } from "../cartesian/area.js"
import { bar } from "../cartesian/bar.js"
import { line } from "../cartesian/line.js"
import { logic } from "../logic.js"
import { donut } from "../polar/donut.js"
import { pie } from "../polar/pie.js"
import { rendering } from "../rendering.js"

/**
 * Combines logic, rendering, and chart-specific renderer into a complete chart type.
 * @param {Object} chartRenderer - Chart-specific renderer (e.g., { renderChart })
 * @returns {Object} Combined chart object with logic, rendering, and renderer methods
 */
function combineRenderer(chartRenderer) {
  return { ...logic, ...rendering, ...chartRenderer }
}

export const areaChart = combineRenderer(area)
export const barChart = combineRenderer(bar)
export const lineChart = combineRenderer(line)
export const pieChart = combineRenderer(pie)
export const donutChart = combineRenderer(donut)

// Export chart object for declarative helpers (composition style)
export { chart } from "../index.js"

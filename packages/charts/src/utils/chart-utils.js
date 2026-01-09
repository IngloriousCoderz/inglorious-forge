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
 * Creates a chart by combining logic, rendering, and chart-specific renderer
 * @param {Object} chartRenderer - Chart-specific renderer (e.g., { renderChart })
 * @returns {Object} Combined chart object with logic, rendering, and renderer methods
 */
function createChart(chartRenderer) {
  return {
    ...logic,
    ...rendering,
    ...chartRenderer,
  }
}

// Export all chart types
export const areaChart = createChart(area)
export const barChart = createChart(bar)
export const lineChart = createChart(line)
export const pieChart = createChart(pie)
export const donutChart = createChart(donut)

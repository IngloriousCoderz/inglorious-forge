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

/**
 * Helper to facilitate use in render(api)
 * @param {Object} api - The api coming from the render
 * @param {String} entity - The name of the entity (ex: "productChart")
 * @param {Function} callback - The function that receives the instance and returns the template
 */
export const chart = (api, entity, callback) => {
  const chartType = api.getType("chart")
  if (!chartType) {
    return null
  }
  const instance = chartType.forEntity(entity, api)
  if (!instance) {
    return null
  }
  return callback(instance)
}

import { svg } from "lit-html"

import { getChartType } from "./registry.js"

/**
 * @typedef {import('../types/charts').ChartEntity} ChartEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('lit-html').TemplateResult} TemplateResult
 */

export const rendering = {
  /**
   * Renders the chart component.
   * @param {ChartEntity} entity
   * @param {Api} api
   * @returns {TemplateResult}
   */
  render(entity, api) {
    const chart = getChartType(entity.type)
    if (!chart) {
      return svg`<text x="50%" y="50%" text-anchor="middle" fill="#999">Unknown chart type</text>`
    }
    return chart.renderChart(entity, api)
  },
}

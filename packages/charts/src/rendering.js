import { svg } from "@inglorious/web"

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
    const chart = api.getType(entity.type)
    if (!chart) {
      return svg`<text x="50%" y="50%" text-anchor="middle" fill="#999">Unknown chart type</text>`
    }
    return chart.renderChart(entity, api)
  },
}

import { svg } from "@inglorious/web"

/**
 * @typedef {import('../types/charts').ChartEntity} ChartEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('lit-html').TemplateResult} TemplateResult
 */

/**
 * Renders the chart component.
 * @param {ChartEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const chart = api.getType(entity.type)
  if (!chart) {
    return svg`<text x="50%" y="50%" text-anchor="middle" fill="#999">Unknown chart type</text>`
  }
  const renderType = chart.render
  if (!renderType) {
    return svg`<text x="50%" y="50%" text-anchor="middle" fill="#999">Chart renderer not found</text>`
  }
  return renderType(entity, api)
}

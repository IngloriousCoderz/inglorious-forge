import { html } from "@inglorious/web"

import { formatNumber } from "../utils/data-utils.js"

/**
 * Renders the chart tooltip overlay.
 * Reused by cartesian charts (line, area, bar).
 *
 * @param {import('../types/charts').ChartEntity} entity
 * @param {Object} props
 * @param {any} api
 * @returns {import('lit-html').TemplateResult}
 */
// eslint-disable-next-line no-unused-vars
export function renderTooltip(entity, props, api) {
  if (!entity?.tooltip) {
    return html``
  }

  return html`
    <div
      class="iw-chart-modal"
      style="left:${entity.tooltipX}px; top:${entity.tooltipY}px"
    >
      <div class="iw-chart-modal-header">
        <span
          class="iw-chart-modal-color"
          style="background-color: ${entity.tooltip.color};"
        ></span>
        <span class="iw-chart-modal-label">${entity.tooltip.label}</span>
      </div>
      <div class="iw-chart-modal-body">
        <div class="iw-chart-modal-value">
          ${formatNumber(entity.tooltip.value)}
        </div>
      </div>
    </div>
  `
}

/**
 * Creates a tooltip component for composition mode (Recharts-style)
 * This factory function returns a component function that can be used in chart composition
 *
 * @returns {Function} Component function that accepts (entity, props, api) and returns a composition function
 *
 * @example
 * // In line.js, area.js, bar.js:
 * import { createTooltipComponent } from "../component/tooltip.js"
 *
 * export const line = {
 *   renderTooltip: createTooltipComponent(),
 * }
 */
export function createTooltipComponent() {
  return (entity, props, api) => {
    const tooltipFn = (ctx) => {
      const entityFromContext = ctx.entity || entity
      return renderTooltip(entityFromContext, {}, api)
    }
    // Mark as tooltip component for stable identification during processing
    tooltipFn.isTooltip = true
    return tooltipFn
  }
}

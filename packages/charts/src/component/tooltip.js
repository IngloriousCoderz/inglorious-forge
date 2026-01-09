import { html } from "lit-html"

import { formatNumber } from "../utils/data-utils.js"

/**
 * Renders the chart tooltip overlay.
 * Reused by cartesian charts (line, area, bar).
 *
 * @param {import('../types/charts').ChartEntity} entity
 * @returns {import('lit-html').TemplateResult}
 */
export function renderTooltip(entity) {
  if (!entity.tooltip) {
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

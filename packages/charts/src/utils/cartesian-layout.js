/**
 * Cartesian layout utilities
 * Common layout logic for cartesian charts (area, line, bar)
 */

import { html, svg } from "lit-html"

import { renderEmptyState } from "../component/empty-state.js"
import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
import { renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { isMultiSeries } from "./data-utils.js"
import { createCartesianContext } from "./scales.js"
import { createTooltipMoveHandler } from "./tooltip-handlers.js"

/**
 * Renders the common cartesian chart layout
 * @param {Object} params
 * @param {any} params.entity - Chart entity
 * @param {import('@inglorious/web').Api} params.api - Web API instance
 * @param {string} params.chartType - Chart type ("area", "line", "bar")
 * @param {import('lit-html').TemplateResult} params.chartContent - Chart-specific content (areas, lines, bars)
 * @param {boolean} [params.showLegend] - Whether to show legend (defaults to entity.showLegend for multi-series)
 * @returns {import('lit-html').TemplateResult} Complete chart HTML
 */
export function renderCartesianLayout({
  entity,
  api,
  chartType,
  chartContent,
  showLegend = undefined,
}) {
  // Check for empty state
  // eslint-disable-next-line no-magic-numbers
  if (!entity.data || entity.data.length === 0) {
    return html`
      <div class="iw-chart">
        ${renderEmptyState({
          width: entity.width,
          height: entity.height,
        })}
      </div>
    `
  }

  // Create context with scales and dimensions
  const context = createCartesianContext(entity, chartType)
  const { xScale, yScale, dimensions } = context
  const { width, height, padding } = dimensions

  // Independent components - declarative composition
  const grid = entity.showGrid
    ? renderGrid({
        entity,
        xScale,
        yScale,
        width,
        height,
        padding,
      })
    : svg``

  const xAxis = renderXAxis({
    entity,
    xScale,
    yScale,
    width,
    height,
    padding,
  })

  const yAxis = renderYAxis({
    yScale,
    height,
    padding,
  })

  // Legend - only for multiple series
  const shouldShowLegend =
    showLegend !== undefined
      ? showLegend
      : isMultiSeries(entity.data) && entity.showLegend
  const legend = shouldShowLegend
    ? renderLegend({
        series: entity.data,
        colors: entity.colors,
        width,
        padding,
      })
    : svg``

  // SVG container
  const svgContent = svg`
    <svg
      width=${width}
      height=${height}
      viewBox="0 0 ${width} ${height}"
      class="iw-chart-svg"
      @mousemove=${createTooltipMoveHandler({ entity, api })}
    >
      ${grid}
      ${xAxis}
      ${yAxis}
      ${chartContent}
      ${legend}
    </svg>
  `

  return html`
    <div class="iw-chart" style="display: block; margin: 0; padding: 0; position: relative; width: 100%; box-sizing: border-box;">${svgContent} ${renderTooltip(entity)}</div>
  `
}


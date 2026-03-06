/**
 * Cartesian layout utilities
 * Common layout logic for cartesian charts (area, line, bar)
 */

import { html, svg } from "@inglorious/web"

import { renderBrush } from "../component/brush.js"
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
 * @param {any} entity - Chart entity
 * @param {Object} props
 * @param {string} props.chartType - Chart type ("area", "line", "bar")
 * @param {import('lit-html').TemplateResult} props.chartContent - Chart-specific content (areas, lines, bars)
 * @param {boolean} [props.showLegend] - Whether to show legend (defaults to entity.showLegend for multi-series)
 * @param {import('@inglorious/web').Api} api - Web API instance
 * @returns {import('lit-html').TemplateResult} Complete chart HTML
 */
export function renderCartesianLayout(entity, props, api) {
  const { chartType, chartContent, showLegend = undefined } = props || {}
  // Check for empty state
  // eslint-disable-next-line no-magic-numbers
  if (!entity.data || entity.data.length === 0) {
    return html`
      <div class="iw-chart">
        ${renderEmptyState(
          entity,
          {
            width: entity.width,
            height: entity.height,
          },
          api,
        )}
      </div>
    `
  }

  // Check if brush is enabled and adjust height accordingly
  // eslint-disable-next-line no-magic-numbers
  const brushHeight = entity.brush?.enabled ? 60 : 0
  // eslint-disable-next-line no-magic-numbers
  const chartHeight = entity.height || 400
  const totalHeight = chartHeight + brushHeight

  // Create context with scales and dimensions
  const context = createCartesianContext(entity, chartType)
  let { xScale, yScale, dimensions } = context
  const { width, height, padding } = dimensions

  // Apply zoom if brush is enabled (similar to composition mode)
  if (entity.brush?.enabled && entity.brush.startIndex !== undefined) {
    const { startIndex, endIndex } = entity.brush
    xScale = xScale.copy().domain([startIndex, endIndex])
  }

  // Independent components - declarative composition
  const grid = entity.showGrid
    ? renderGrid(
        entity,
        {
          xScale,
          yScale,
          width,
          height,
          padding,
        },
        api,
      )
    : svg``

  const xAxis = renderXAxis(
    entity,
    {
      xScale,
      yScale,
      width,
      height,
      padding,
    },
    api,
  )

  const yAxis = renderYAxis(
    entity,
    {
      yScale,
      height,
      padding,
    },
    api,
  )

  // Legend - only for multiple series
  const shouldShowLegend =
    showLegend !== undefined
      ? showLegend
      : isMultiSeries(entity.data) && entity.showLegend
  const legend = shouldShowLegend
    ? renderLegend(
        entity,
        {
          series: entity.data,
          colors: entity.colors,
          width,
          padding,
        },
        api,
      )
    : svg``

  // Brush - render if enabled in config mode
  const brush = entity.brush?.enabled
    ? renderBrush(
        entity,
        {
          xScale,
          width,
          height,
          padding,
          // eslint-disable-next-line no-magic-numbers
          brushHeight: entity.brush.height || 30,
          dataKey: entity.dataKey || "name",
        },
        api,
      )
    : svg``

  // SVG container
  const svgContent = svg`
    <svg
      width=${width}
      height=${totalHeight}
      viewBox="0 0 ${width} ${totalHeight}"
      class="iw-chart-svg"
      @mousemove=${createTooltipMoveHandler({ entity, api })}
    >
      ${grid}
      ${xAxis}
      ${yAxis}
      ${chartContent}
      ${legend}
      ${brush}
    </svg>
  `

  return html`
    <div
      class="iw-chart"
      style="display: block; margin: 0; padding: 0; position: relative; width: 100%; box-sizing: border-box;"
    >
      ${svgContent} ${renderTooltip(entity, {}, api)}
    </div>
  `
}

/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { renderEmptyState } from "../component/empty-state.js"
import { renderGrid } from "../component/grid.js"
import { renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { renderRectangle } from "../shape/rectangle.js"
import { formatNumber } from "../utils/data-utils.js"
import { createCartesianContext } from "../utils/scales.js"
import {
  createTooltipHandlers,
  createTooltipMoveHandler,
} from "../utils/tooltip-handlers.js"

export const bar = {
  renderChart(entity, api) {
    if (!entity.data || entity.data.length === 0) {
      return renderEmptyState({
        width: entity.width,
        height: entity.height,
      })
    }

    // Create context with scales and dimensions
    const context = createCartesianContext(entity, "bar")
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
      : ""

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

    // Bar rectangles - uses Rectangle primitives (like Recharts BarRectangles)
    const bars = renderBarRectangles({
      data: entity.data,
      xScale,
      yScale,
      height,
      padding,
      colors: entity.colors,
      showLabel: entity.showLabel !== false,
      entity,
      api,
    })

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
        ${bars}
      </svg>
    `

    return html`
      <div class="iw-chart">${svgContent} ${renderTooltip(entity)}</div>
    `
  },
}

/**
 * Renders bar rectangles using Rectangle primitives
 * Similar to Recharts BarRectangles function
 */
function renderBarRectangles({
  data,
  xScale,
  yScale,
  height,
  padding,
  colors,
  showLabel = true,
  entity,
  api,
}) {
  if (!data || data.length === 0) {
    return svg``
  }

  const barWidth = xScale.bandwidth()

  return svg`
    ${repeat(
      data,
      (d, i) => i,
      (d, i) => {
        const category = d.label || d.name || d.category
        const x = xScale(category)
        const y = yScale(d.value)
        const barHeight = height - padding.bottom - y
        const color = d.color || colors[i % colors.length]

        const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
          entity,
          api,
          tooltipData: {
            label: category,
            value: d.value,
            color: color,
          },
        })

        return svg`
          <g class="iw-chart-bar">
            ${renderRectangle({
              x,
              y,
              width: barWidth,
              height: barHeight,
              fill: color,
              className: "iw-chart-bar-rectangle",
              onMouseEnter,
              onMouseLeave,
            })}
            ${
              showLabel
                ? svg`
                <text
                  x=${x + barWidth / 2}
                  y=${y - 5}
                  text-anchor="middle"
                  font-size="0.6875em"
                  fill="#555"
                  font-weight="500"
                >
                  ${formatNumber(d.value)}
                </text>
              `
                : ""
            }
          </g>
        `
      },
    )}
  `
}

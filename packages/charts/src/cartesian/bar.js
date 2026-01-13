/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { renderRectangle } from "../shape/rectangle.js"
import { renderCartesianLayout } from "../utils/cartesian-layout.js"
import { formatNumber } from "../utils/data-utils.js"
import { createCartesianContext } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

export const bar = {
  renderChart(entity, api) {
    // Bar rectangles - uses Rectangle primitives (like Recharts BarRectangles)
    const bars = renderBarRectangles({
      data: entity.data,
      entity,
      api,
    })

    return renderCartesianLayout({
      entity,
      api,
      chartType: "bar",
      chartContent: bars,
      showLegend: false, // Bar charts don't show legend
    })
  },
}

/**
 * Renders bar rectangles using Rectangle primitives
 * Similar to Recharts BarRectangles function
 */
function renderBarRectangles({ data, entity, api }) {
  if (!data || data.length === 0) {
    return svg``
  }

  // Create context with scales and dimensions
  const context = createCartesianContext(entity, "bar")
  const { xScale, yScale, dimensions } = context
  const { height, padding } = dimensions
  const colors = entity.colors
  const showLabel = entity.showLabel !== false

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

/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { renderEmptyState } from "../component/empty-state.js"
import { renderGrid } from "../component/grid.js"
import { renderLegend } from "../component/legend.js"
import { renderTooltip } from "../component/tooltip.js"
import { renderXAxis } from "../component/x-axis.js"
import { renderYAxis } from "../component/y-axis.js"
import { renderCurve } from "../shape/curve.js"
import { renderDot } from "../shape/dot.js"
import {
  getDataPointLabel,
  getDataPointX,
  getDataPointY,
  getSeriesValues,
  isMultiSeries,
} from "../utils/data-utils.js"
import { generateLinePath } from "../utils/paths.js"
import { createCartesianContext } from "../utils/scales.js"
import {
  createTooltipHandlers,
  createTooltipMoveHandler,
} from "../utils/tooltip-handlers.js"

export const line = {
  renderChart(entity, api) {
    if (!entity.data || entity.data.length === 0) {
      return renderEmptyState({
        width: entity.width,
        height: entity.height,
      })
    }

    // Create context with scales and dimensions
    const context = createCartesianContext(entity, "line")
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

    // Line curves - uses Curve and Dot primitives (like Recharts Line component)
    const lines = renderLineCurves({
      data: entity.data,
      xScale,
      yScale,
      colors: entity.colors,
      showPoints: entity.showPoints !== false,
      entity,
      api,
    })

    // Legend - only for multiple series
    const legend =
      isMultiSeries(entity.data) && entity.showLegend
        ? renderLegend({
            series: entity.data,
            colors: entity.colors,
            width,
            padding,
          })
        : ""

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
        ${lines}
        ${legend}
      </svg>
    `

    return html`
      <div class="iw-chart">${svgContent} ${renderTooltip(entity)}</div>
    `
  },
}

/**
 * Renders line curves using Curve and Dot primitives
 * Similar to Recharts Line component
 */
function renderLineCurves({
  data,
  xScale,
  yScale,
  colors,
  showPoints = true,
  entity,
  api,
}) {
  if (!data || data.length === 0) {
    return svg``
  }

  if (isMultiSeries(data)) {
    return svg`
      ${data.map((series, seriesIndex) => {
        const values = getSeriesValues(series)
        const pathData = generateLinePath(values, xScale, yScale)
        const color = series.color || colors[seriesIndex % colors.length]
        const seriesName =
          series.name || series.label || `Series ${seriesIndex + 1}`

        return svg`
          <g class="iw-chart-line">
            ${renderCurve({
              d: pathData,
              stroke: color,
              className: "iw-chart-line",
            })}
            ${
              showPoints
                ? repeat(
                    values,
                    (d, i) => i,
                    (d) => {
                      const x = xScale(getDataPointX(d))
                      const y = yScale(getDataPointY(d))
                      const label = getDataPointLabel(d, seriesName)
                      const value = getDataPointY(d)

                      const { onMouseEnter, onMouseLeave } =
                        createTooltipHandlers({
                          entity,
                          api,
                          tooltipData: {
                            label,
                            value,
                            color,
                          },
                        })

                      return renderDot({
                        cx: x,
                        cy: y,
                        fill: color,
                        className: "iw-chart-dot",
                        onMouseEnter,
                        onMouseLeave,
                      })
                    },
                  )
                : ""
            }
          </g>
        `
      })}
    `
  }

  const pathData = generateLinePath(data, xScale, yScale)
  const color = colors[0]

  return svg`
    <g class="iw-chart-line">
      ${renderCurve({
        d: pathData,
        stroke: color,
        className: "iw-chart-line",
      })}
      ${
        showPoints
          ? repeat(
              data,
              (d, i) => i,
              (d) => {
                const x = xScale(getDataPointX(d))
                const y = yScale(getDataPointY(d))
                const label = getDataPointLabel(d)
                const value = getDataPointY(d)

                const { onMouseEnter, onMouseLeave } = createTooltipHandlers({
                  entity,
                  api,
                  tooltipData: {
                    label,
                    value,
                    color,
                  },
                })

                return renderDot({
                  cx: x,
                  cy: y,
                  fill: color,
                  className: "iw-chart-dot",
                  onMouseEnter,
                  onMouseLeave,
                })
              },
            )
          : ""
      }
    </g>
  `
}

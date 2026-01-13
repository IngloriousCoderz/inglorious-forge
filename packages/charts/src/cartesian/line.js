/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { renderCurve } from "../shape/curve.js"
import { renderDot } from "../shape/dot.js"
import { renderCartesianLayout } from "../utils/cartesian-layout.js"
import {
  getDataPointLabel,
  getDataPointX,
  getDataPointY,
  getSeriesValues,
  isMultiSeries,
} from "../utils/data-utils.js"
import { generateLinePath } from "../utils/paths.js"
import { createCartesianContext } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

export const line = {
  renderChart(entity, api) {
    // Line curves - uses Curve and Dot primitives
    const lines = renderLineCurves({
      data: entity.data,
      entity,
      api,
    })

    return renderCartesianLayout({
      entity,
      api,
      chartType: "line",
      chartContent: lines,
    })
  },
}

/**
 * Renders line curves using Curve and Dot primitives
 * Similar to Recharts Line component
 */
function renderLineCurves({ data, entity, api }) {
  if (!data || data.length === 0) {
    return svg``
  }

  // Create context with scales and dimensions
  const context = createCartesianContext(entity, "line")
  const { xScale, yScale } = context
  const colors = entity.colors
  const showPoints = entity.showPoints !== false

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

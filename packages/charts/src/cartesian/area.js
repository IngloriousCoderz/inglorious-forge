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
import {
  calculateStackedData,
  generateAreaPath,
  generateLinePath,
  generateStackedAreaPath,
} from "../utils/paths.js"
import { createCartesianContext } from "../utils/scales.js"
import { createTooltipHandlers } from "../utils/tooltip-handlers.js"

export const area = {
  renderChart(entity, api) {
    // Area curves - uses Curve and Dot primitives (like Recharts Area component)
    // Default to non-stacked (stacked = false) for independent series
    const areas = renderAreaCurves({
      data: entity.data,
      entity,
      api,
    })

    return renderCartesianLayout({
      entity,
      api,
      chartType: "area",
      chartContent: areas,
    })
  },
}

/**
 * Renders area curves using Curve and Dot primitives
 * Similar to Recharts Area component
 */
function renderAreaCurves({ data, entity, api }) {
  if (!data || data.length === 0) {
    return svg``
  }

  // Create context with scales and dimensions
  const context = createCartesianContext(entity, "area")
  const { xScale, yScale } = context
  const baseValue = 0
  const colors = entity.colors
  const showPoints = entity.showPoints !== false
  const stacked = entity.stacked === true // Only stack if explicitly set to true

  if (isMultiSeries(data)) {
    if (stacked) {
      // Calculate stacked data for all series
      const stackedData = calculateStackedData(data)

      // Render all areas and lines first
      const areasAndLines = data.map((series, seriesIndex) => {
        const values = getSeriesValues(series)
        // Use stacked data for this series
        const seriesStackedData = stackedData[seriesIndex] || []
        const areaPath = generateStackedAreaPath(
          values,
          xScale,
          yScale,
          seriesStackedData,
        )
        // Line path uses top of stacked area (y1 values)
        const linePath = generateLinePath(
          values.map((d, i) => ({
            ...d,
            y: seriesStackedData[i]?.[1] ?? d.y ?? d.value,
          })),
          xScale,
          yScale,
        )
        const color = series.color || colors[seriesIndex % colors.length]

        return svg`
          <g class="iw-chart-area">
            ${renderCurve({
              d: areaPath,
              fill: color,
              fillOpacity: "0.6",
              className: "iw-chart-area-fill",
            })}
            ${renderCurve({
              d: linePath,
              stroke: color,
              className: "iw-chart-area-line",
            })}
          </g>
        `
      })

      // Render all points last (so they appear on top)
      const points = showPoints
        ? data.map((series, seriesIndex) => {
            const values = getSeriesValues(series)
            const seriesStackedData = stackedData[seriesIndex] || []
            const color = series.color || colors[seriesIndex % colors.length]

            return repeat(
              values,
              (d, i) => `${seriesIndex}-${i}`,
              (d, i) => {
                const x = xScale(getDataPointX(d))
                // Use stacked y1 value for point position
                const y = yScale(seriesStackedData[i]?.[1] ?? getDataPointY(d))
                const seriesName =
                  series.name || series.label || `Series ${seriesIndex + 1}`
                const label = getDataPointLabel(d, seriesName)
                const value = seriesStackedData[i]?.[1] ?? getDataPointY(d)

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
          })
        : []

      return svg`
        ${areasAndLines}
        ${points}
      `
    } else {
      // Non-stacked: render each series independently
      // Render in reverse order to ensure larger areas are drawn on top
      const reversedData = [...data].reverse()

      const areasAndLines = reversedData.map((series, seriesIndex) => {
        const originalIndex = data.length - 1 - seriesIndex // Get original index for color
        const values = getSeriesValues(series)
        const areaPath = generateAreaPath(values, xScale, yScale, baseValue)
        const linePath = generateLinePath(values, xScale, yScale)
        const color = series.color || colors[originalIndex % colors.length]

        return svg`
          <g class="iw-chart-area">
            ${renderCurve({
              d: areaPath,
              fill: color,
              fillOpacity: "0.6",
              className: "iw-chart-area-fill",
            })}
            ${renderCurve({
              d: linePath,
              stroke: color,
              className: "iw-chart-area-line",
            })}
          </g>
        `
      })

      // Render all points last (so they appear on top)
      const points = showPoints
        ? reversedData.map((series, seriesIndex) => {
            const originalIndex = data.length - 1 - seriesIndex
            const values = getSeriesValues(series)
            const color = series.color || colors[originalIndex % colors.length]

            return repeat(
              values,
              (d, i) => `${originalIndex}-${i}`,
              (d) => {
                const x = xScale(getDataPointX(d))
                const y = yScale(getDataPointY(d))
                const seriesName =
                  series.name || series.label || `Series ${originalIndex + 1}`
                const label = getDataPointLabel(d, seriesName)
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
          })
        : []

      return svg`
        ${areasAndLines}
        ${points}
      `
    }
  }

  const areaPath = generateAreaPath(data, xScale, yScale, baseValue)
  const linePath = generateLinePath(data, xScale, yScale)
  const color = colors[0]

  return svg`
    <g class="iw-chart-area">
      ${renderCurve({
        d: areaPath,
        fill: color,
        fillOpacity: "0.6",
        className: "iw-chart-area-area",
      })}
      ${renderCurve({
        d: linePath,
        stroke: color,
        className: "iw-chart-area-curve",
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

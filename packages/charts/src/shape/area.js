/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { getSeriesValues } from "../component/chart-helpers.js"
import {
  calculateStackedData,
  generateAreaPath,
  generateLinePath,
  generateStackedAreaPath,
} from "../utils/paths.js"

/**
 * @param {Object} params
 * @param {any[]} params.data
 * @param {import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} params.xScale
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @param {number} params.baseValue
 * @param {string[]} params.colors
 * @param {boolean} params.showPoints
 * @param {boolean} params.stacked
 * @returns {import('lit-html').TemplateResult}
 */
export function renderArea({
  data,
  xScale,
  yScale,
  baseValue = 0,
  colors,
  showPoints = true,
  stacked = false,
}) {
  if (!data || data.length === 0) {
    return svg``
  }

  const isMultiSeries = Array.isArray(data[0]?.values)

  if (isMultiSeries) {
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
        <g>
          <path
            d=${areaPath}
            fill=${color}
            fill-opacity="0.6"
            class="iw-chart-area"
          />
          <path
            d=${linePath}
            stroke=${color}
            fill="none"
            stroke-width="0.15625em"
            class="iw-chart-line"
          />
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
                const x = xScale(d.x ?? d.date ?? 0)
                // Use stacked y1 value for point position
                const y = yScale(
                  seriesStackedData[i]?.[1] ?? d.y ?? d.value ?? 0,
                )
                return svg`
                <circle
                  cx=${x}
                  cy=${y}
                  r="0.25em"
                  fill=${color}
                  stroke="white"
                  stroke-width="0.125em"
                  class="iw-chart-point"
                />
              `
              },
            )
          })
        : []

      return svg`
        ${areasAndLines}
        ${points}
      `
    } else {
      // Render in reverse order to match stacked visual order (first series on bottom, last on top)
      // But keep original color indices to maintain correct colors
      const areasAndLines = data
        .map((series, seriesIndex) => ({ series, seriesIndex }))
        .reverse()
        .map(({ series, seriesIndex }) => {
          const values = getSeriesValues(series)
          const areaPath = generateAreaPath(values, xScale, yScale, baseValue)
          const linePath = generateLinePath(values, xScale, yScale)
          const color = series.color || colors[seriesIndex % colors.length]

          return svg`
            <g>
              <path
                d=${areaPath}
                fill=${color}
                fill-opacity="0.6"
                class="iw-chart-area"
              />
              <path
                d=${linePath}
                stroke=${color}
                fill="none"
                stroke-width="0.15625em"
                class="iw-chart-line"
              />
            </g>
          `
        })

      // Render all points last (so they appear on top)
      const points = showPoints
        ? data.map((series, seriesIndex) => {
            const values = getSeriesValues(series)
            const color = series.color || colors[seriesIndex % colors.length]

            return repeat(
              values,
              (d, i) => `${seriesIndex}-${i}`,
              (d) => {
                const x = xScale(d.x ?? d.date ?? 0)
                const y = yScale(d.y ?? d.value ?? 0)
                return svg`
                  <circle
                    cx=${x}
                    cy=${y}
                    r="0.25em"
                    fill=${color}
                    stroke="white"
                    stroke-width="0.125em"
                    class="iw-chart-point"
                  />
                `
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
    <g>
      <path
        d=${areaPath}
        fill=${color}
        fill-opacity="0.6"
        class="iw-chart-area"
      />
      <path
        d=${linePath}
        stroke=${color}
        fill="none"
        stroke-width="0.15625em"
        class="iw-chart-line"
      />
      ${
        showPoints
          ? repeat(
              data,
              (d, i) => i,
              (d) => {
                const x = xScale(d.x ?? d.date ?? 0)
                const y = yScale(d.y ?? d.value ?? 0)
                return svg`
                <circle
                  cx=${x}
                  cy=${y}
                  r="0.25em"
                  fill=${color}
                  stroke="white"
                  stroke-width="0.125em"
                  class="iw-chart-point"
                />
              `
              },
            )
          : ""
      }
    </g>
  `
}

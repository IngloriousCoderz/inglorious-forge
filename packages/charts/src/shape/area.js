/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { getSeriesValues } from "../component/chart-helpers.js"
import { generateAreaPath, generateLinePath } from "../utils/paths.js"

/**
 * @param {Object} params
 * @param {any[]} params.data
 * @param {import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} params.xScale
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @param {number} params.baseValue
 * @param {string[]} params.colors
 * @param {boolean} params.showPoints
 * @returns {import('lit-html').TemplateResult}
 */
export function renderArea({
  data,
  xScale,
  yScale,
  baseValue = 0,
  colors,
  showPoints = true,
}) {
  if (!data || data.length === 0) {
    return svg``
  }

  const isMultiSeries = Array.isArray(data[0]?.values)

  if (isMultiSeries) {
    return svg`
      ${data.map((series, seriesIndex) => {
        const values = getSeriesValues(series)
        const areaPath = generateAreaPath(values, xScale, yScale, baseValue)
        const linePath = generateLinePath(values, xScale, yScale)
        const color = series.color || colors[seriesIndex % colors.length]

        return svg`
          <g>
            <path
              d=${areaPath}
              fill=${color}
              fill-opacity="0.3"
              class="iw-chart-area"
            />
            <path
              d=${linePath}
              stroke=${color}
              fill="none"
              stroke-width="0.15625em"
              class="iw-chart-line"
            />
            ${showPoints
              ? repeat(
                  values,
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
              : ""}
          </g>
        `
      })}
    `
  }

  const areaPath = generateAreaPath(data, xScale, yScale, baseValue)
  const linePath = generateLinePath(data, xScale, yScale)
  const color = colors[0]

  return svg`
    <g>
      <path
        d=${areaPath}
        fill=${color}
        fill-opacity="0.3"
        class="iw-chart-area"
      />
      <path
        d=${linePath}
        stroke=${color}
        fill="none"
        stroke-width="0.15625em"
        class="iw-chart-line"
      />
      ${showPoints
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
        : ""}
    </g>
  `
}


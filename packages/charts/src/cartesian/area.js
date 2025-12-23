/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import {
  getSeriesValues,
  renderAxisLines,
  renderGrid,
  renderLegend,
  renderXAxis,
  renderYAxis,
} from "../component/chart-helpers.js"
import { generateAreaPath, generateLinePath } from "../utils/paths.js"
import { createScales } from "../utils/scales.js"

export const area = {
  renderChart(entity) {
    if (!entity.data || entity.data.length === 0) {
      return html`
        <div class="iw-chart">
          <svg width=${entity.width} height=${entity.height} viewBox="0 0 ${entity.width} ${entity.height}">
            <text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="0.875em">No data</text>
          </svg>
        </div>
      `
    }

    const { xScale, yScale } = createScales(entity, "line")

    // Grid
    const grid = entity.showGrid ? renderGrid(entity, xScale, yScale) : ""

    // axis
    const axes = svg`
      ${renderAxisLines(entity, yScale)}
      ${renderXAxis(entity, xScale, yScale)}
      ${renderYAxis(entity, yScale)}
    `

    // area rendering
    const isMultiSeries = Array.isArray(entity.data[0]?.values)

    // legend
    const legend = isMultiSeries
      ? renderLegend(entity, entity.data)
      : ""

    const areas = isMultiSeries
      ? entity.data.map((series, seriesIndex) => {
          const values = getSeriesValues(series)
          const areaPath = generateAreaPath(values, xScale, yScale, 0)
          const linePath = generateLinePath(values, xScale, yScale)
          const color =
            series.color || entity.colors[seriesIndex % entity.colors.length]

          const points = repeat(
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
              ${points}
            </g>
          `
        })
      : [
          // Uma série simples
          (() => {
            const areaPath = generateAreaPath(entity.data, xScale, yScale, 0)
            const linePath = generateLinePath(entity.data, xScale, yScale)
            const color = entity.colors[0]

            const points = repeat(
              entity.data,
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
                ${points}
              </g>
            `
          })(),
        ]

    const svgContent = svg`
      <svg
        width=${entity.width}
        height=${entity.height}
        viewBox="0 0 ${entity.width} ${entity.height}"
        class="iw-chart-svg"
      >
        ${grid}
        ${axes}
        ${areas}
        ${legend}
      </svg>
    `

    return html`
      <div class="iw-chart">
        ${svgContent}
      </div>
    `
  },
}


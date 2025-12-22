/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { logic } from "../logic.js"
import { rendering } from "../rendering.js"
import {
  getSeriesValues,
  renderAxisLines,
  renderGrid,
  renderXAxis,
  renderYAxis,
} from "../utils/chart-helpers.js"
import { generateLinePath } from "../utils/paths.js"
import { createScales } from "../utils/scales.js"

export const line = {
  ...logic,
  ...rendering,

  renderChart(entity) {
    if (!entity.data || entity.data.length === 0) {
      return svg`
        <svg width=${entity.width} height=${entity.height} viewBox="0 0 ${entity.width} ${entity.height}">
          <text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="14">No data</text>
        </svg>
      `
    }

    const { xScale, yScale } = createScales(entity, "line")

    // Grid
    const grid = entity.showGrid ? renderGrid(entity, xScale, yScale) : ""

    // Eixos
    const axes = svg`
      ${renderAxisLines(entity)}
      ${renderXAxis(entity, xScale)}
      ${renderYAxis(entity, yScale)}
    `

    // Render das linhas
    // Se data[0] tem .values, é múltiplas séries, senão é uma série simples
    const isMultiSeries = Array.isArray(entity.data[0]?.values)

    const paths = isMultiSeries
      ? entity.data.map((series, seriesIndex) => {
          const values = getSeriesValues(series)
          const pathData = generateLinePath(values, xScale, yScale)
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
                  r="4"
                  fill=${color}
                  stroke="white"
                  stroke-width="2"
                  class="iw-chart-point"
                />
              `
            },
          )

          return svg`
            <g>
              <path
                d=${pathData}
                stroke=${color}
                fill="none"
                stroke-width="2.5"
                class="iw-chart-line"
              />
              ${points}
            </g>
          `
        })
      : [
          // Uma série simples
          (() => {
            const pathData = generateLinePath(entity.data, xScale, yScale)
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
                    r="4"
                    fill=${color}
                    stroke="white"
                    stroke-width="2"
                    class="iw-chart-point"
                  />
                `
              },
            )

            return svg`
              <g>
                <path
                  d=${pathData}
                  stroke=${color}
                  fill="none"
                  stroke-width="2.5"
                  class="iw-chart-line"
                />
                ${points}
              </g>
            `
          })(),
        ]

    return svg`
      <svg
        width=${entity.width}
        height=${entity.height}
        viewBox="0 0 ${entity.width} ${entity.height}"
        class="iw-chart-svg"
      >
        ${grid}
        ${axes}
        ${paths}
      </svg>
    `
  },
}

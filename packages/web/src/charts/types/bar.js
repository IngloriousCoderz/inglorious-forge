/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { logic } from "../logic.js"
import { rendering } from "../rendering.js"
import {
  renderAxisLines,
  renderYAxis,
  renderYGrid,
} from "../utils/chart-helpers.js"
import { formatNumber } from "../utils/format.js"
import { createScales } from "../utils/scales.js"

export const bar = {
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

    const { xScale, yScale } = createScales(entity, "bar")
    const barWidth = xScale.bandwidth()
    const { padding, height } = entity

    // Grid
    const grid = entity.showGrid ? renderYGrid(entity, yScale) : ""

    // Eixos
    const axes = svg`
      ${renderAxisLines(entity)}
      ${this.renderXAxisLabels(entity, xScale)}
      ${renderYAxis(entity, yScale)}
    `

    // Barras
    const bars = repeat(
      entity.data,
      (d, i) => i,
      (d, i) => {
        const category = d.label || d.name || d.category
        const x = xScale(category)
        const y = yScale(d.value)
        const barHeight = height - padding.bottom - y
        const color = d.color || entity.colors[i % entity.colors.length]

        return svg`
          <g>
            <rect
              x=${x}
              y=${y}
              width=${barWidth}
              height=${barHeight}
              fill=${color}
              class="iw-chart-bar"
              rx="4"
              ry="4"
            />
            <text
              x=${x + barWidth / 2}
              y=${y - 5}
              text-anchor="middle"
              font-size="11"
              fill="#555"
              font-weight="500"
            >
              ${formatNumber(d.value)}
            </text>
          </g>
        `
      },
    )

    return svg`
      <svg
        width=${entity.width}
        height=${entity.height}
        viewBox="0 0 ${entity.width} ${entity.height}"
        class="iw-chart-svg"
      >
        ${grid}
        ${axes}
        ${bars}
      </svg>
    `
  },

  renderXAxisLabels(entity, xScale) {
    const categories = entity.data.map((d) => d.label || d.name || d.category)
    const { height, padding } = entity

    return svg`
      ${repeat(
        categories,
        (cat) => cat,
        (cat) => {
          const x = xScale(cat) + xScale.bandwidth() / 2
          return svg`
            <text
              x=${x}
              y=${height - padding.bottom + 20}
              text-anchor="middle"
              font-size="11"
              fill="#777"
            >
              ${cat}
            </text>
          `
        },
      )}
    `
  },
}

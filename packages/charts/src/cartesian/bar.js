/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import {
  renderAxisLines,
  renderYAxis,
  renderYGrid,
} from "../component/chart-helpers.js"
import { logic } from "../logic.js"
import { rendering } from "../rendering.js"
import { formatNumber } from "../utils/format.js"
import { createScales } from "../utils/scales.js"

export const bar = {
  ...logic,
  ...rendering,

  renderChart(entity) {
    if (!entity.data || entity.data.length === 0) {
      return svg`
        <svg width=${entity.width} height=${entity.height} viewBox="0 0 ${entity.width} ${entity.height}">
          <text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="0.875em">No data</text>
        </svg>
      `
    }

    const { xScale, yScale } = createScales(entity, "bar")
    const barWidth = xScale.bandwidth()
    const { padding, height } = entity

    // Grid
    const grid = entity.showGrid ? renderYGrid(entity, yScale) : ""

    // axis
    const axes = svg`
      ${renderAxisLines(entity, yScale)}
      ${renderXAxisLabels(entity, xScale)}
      ${renderYAxis(entity, yScale)}
    `

    // bars
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
              rx="0.25em"
              ry="0.25em"
            />
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
          </g>
        `
      },
    )

    const svgContent = svg`
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

    return html`
      <div class="iw-chart">
        ${svgContent}
      </div>
    `
  },
}

// Helper functions

/**
 * Renders X-axis labels for bar chart.
 * @param {any} entity
 * @param {any} xScale
 * @returns {any}
 */
function renderXAxisLabels(entity, xScale) {
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
            font-size="0.6875em"
            fill="#777"
          >
            ${cat}
          </text>
        `
      },
    )}
  `
}

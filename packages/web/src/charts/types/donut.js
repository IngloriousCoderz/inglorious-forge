/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { logic } from "../logic.js"
import { rendering } from "../rendering.js"
import { formatNumber } from "../utils/format.js"
import { calculatePieData, generateArcPath } from "../utils/paths.js"

export const donut = {
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

    const pieData = calculatePieData(entity.data)
    const centerX = entity.width / 2
    const centerY = entity.height / 2
    const outerRadius = Math.min(entity.width, entity.height) / 2 - 50
    const innerRadius = outerRadius * (entity.innerRadiusRatio || 0.6)

    const slices = repeat(
      pieData,
      (d, i) => i,
      (d, i) => {
        const pathData = generateArcPath(
          innerRadius,
          outerRadius,
          d.startAngle,
          d.endAngle,
        )
        const color = d.data.color || entity.colors[i % entity.colors.length]

        return svg`
          <g transform="translate(${centerX}, ${centerY})">
            <path
              d=${pathData}
              fill=${color}
              class="iw-chart-donut-slice"
              stroke="white"
              stroke-width="2"
            />
          </g>
        `
      },
    )

    // Texto central
    const centerText = entity.centerText
      ? svg`
      <text
        x=${centerX}
        y=${centerY - 5}
        text-anchor="middle"
        font-size="18"
        font-weight="bold"
        fill="#333"
      >
        ${entity.centerText}
      </text>
      <text
        x=${centerX}
        y=${centerY + 15}
        text-anchor="middle"
        font-size="12"
        fill="#777"
      >
        ${formatNumber(pieData.reduce((sum, d) => sum + d.value, 0))}
      </text>
    `
      : ""

    return svg`
      <svg
        width=${entity.width}
        height=${entity.height}
        viewBox="0 0 ${entity.width} ${entity.height}"
        class="iw-chart-svg"
      >
        ${slices}
        ${centerText}
      </svg>
    `
  },
}

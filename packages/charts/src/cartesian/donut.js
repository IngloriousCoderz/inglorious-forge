/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { when } from "lit-html/directives/when.js"

import { logic } from "../logic.js"
import { rendering } from "../rendering.js"
import { formatNumber } from "../utils/format.js"
import { calculatePieData, generateArcPath } from "../utils/paths.js"

export const donut = {
  ...logic,
  ...rendering,

  renderChart(entity, api) {
    if (!entity.data || entity.data.length === 0) {
      return svg`
        <svg width=${entity.width} height=${entity.height} viewBox="0 0 ${entity.width} ${entity.height}">
          <text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="0.875em">No data</text>
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

        const shouldShowTooltip = entity.showTooltip

        return svg`
          <g transform="translate(${centerX}, ${centerY})">
            <path
              d=${pathData}
              fill=${color}
              class="iw-chart-donut-slice"
              stroke="white"
              stroke-width="0.125em"
              data-slice-index=${i}
              @mouseenter=${(e) => {
                if (!shouldShowTooltip) return
                const path = e.target
                const sliceIndex = parseInt(
                  path.getAttribute("data-slice-index"),
                )
                const sliceData = pieData[sliceIndex]
                if (!sliceData) return

                const svgEl = path.closest("svg")
                const rect = svgEl.getBoundingClientRect()
                const angle = (sliceData.startAngle + sliceData.endAngle) / 2
                const angleOffset = angle - Math.PI / 2
                const labelRadius = outerRadius * 1.1
                const x = centerX + Math.cos(angleOffset) * labelRadius
                const y = centerY + Math.sin(angleOffset) * labelRadius

                api.notify(`#${entity.id}:showTooltip`, {
                  label: sliceData.data.label || sliceData.data.name || "",
                  percentage:
                    ((sliceData.endAngle - sliceData.startAngle) /
                      (2 * Math.PI)) *
                    100,
                  value: sliceData.value,
                  color:
                    sliceData.data.color ||
                    entity.colors[sliceIndex % entity.colors.length],
                  x: rect.left + x,
                  y: rect.top + y,
                })
              }}
              @mouseleave=${() => {
                api.notify(`#${entity.id}:hideTooltip`)
              }}
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
        font-size="1.125em"
        font-weight="bold"
        fill="#333"
      >
        ${entity.centerText}
      </text>
      <text
        x=${centerX}
        y=${centerY + 15}
        text-anchor="middle"
        font-size="0.75em"
        fill="#777"
      >
        ${formatNumber(pieData.reduce((sum, d) => sum + d.value, 0))}
      </text>
    `
      : ""

    const svgContent = svg`
      <svg
        width=${entity.width}
        height=${entity.height}
        viewBox="0 0 ${entity.width} ${entity.height}"
        class="iw-chart-svg"
        @mousemove=${(e) => {
          if (!entity.tooltip) return
          const rect = e.currentTarget.getBoundingClientRect()
          api.notify(`#${entity.id}:moveTooltip`, {
            x: e.clientX - rect.left + 15,
            y: e.clientY - rect.top - 15,
          })
        }}
      >
        ${slices}
        ${centerText}
      </svg>
    `

    return html`
      <div class="iw-chart">
        ${svgContent}
        ${when(
          entity.tooltip,
          () => html`
            <div
              class="iw-chart-modal"
              style="left: ${entity.tooltipX}px; top: ${entity.tooltipY}px;"
            >
              <div class="iw-chart-modal-header">
                <span
                  class="iw-chart-modal-color"
                  style="background-color: ${entity.tooltip.color};"
                ></span>
                <span class="iw-chart-modal-label"
                  >${entity.tooltip.label}</span
                >
              </div>
              <div class="iw-chart-modal-body">
                <div class="iw-chart-modal-percentage">
                  ${formatNumber(entity.tooltip.percentage)}%
                </div>
              </div>
            </div>
          `,
        )}
      </div>
    `
  },
}

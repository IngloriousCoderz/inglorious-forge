/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { when } from "lit-html/directives/when.js"

import { logic } from "../logic.js"
import { rendering } from "../rendering.js"
import { formatNumber } from "../utils/format.js"
import { calculatePieData, generateArcPath } from "../utils/paths.js"

/* Utils */
function isDarkColor(hexColor) {
  try {
    const hex = hexColor.replace("#", "")
    if (hex.length !== 6) return false

    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 140
  } catch {
    return false
  }
}

/*  Pie Chart  */
export const pie = {
  ...logic,
  ...rendering,

  renderChart(entity, api) {
    if (!entity.data || entity.data.length === 0) {
      return svg`
        <svg width=${entity.width} height=${entity.height}>
          <text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="14">
            No data
          </text>
        </svg>
      `
    }

    const pieData = calculatePieData(entity.data)
    const centerX = entity.width / 2
    const centerY = entity.height / 2
    const labelPosition = entity.labelPosition || "auto"
    const showTooltipByConfig =
      entity.showTooltip || labelPosition === "tooltip"

    // Extra space for external labels
    const outerPadding =
      labelPosition === "outside" || labelPosition === "auto" ? 60 : 20
    const radius = Math.min(entity.width, entity.height) / 2 - outerPadding

    const slices = repeat(
      pieData,
      (_, i) => i,
      (d, i) => {
        const sliceSize = d.endAngle - d.startAngle
        const angle = (d.startAngle + d.endAngle) / 2
        const percentage = (sliceSize / (2 * Math.PI)) * 100
        const isSmallSlice = sliceSize < Math.PI / 6

        const color = d.data.color || entity.colors[i % entity.colors.length]
        const label = d.data.label || d.data.name || ""

        const shouldShowOutside =
          labelPosition === "outside" ||
          (labelPosition === "auto" && isSmallSlice)
        const shouldShowInside =
          labelPosition === "inside" ||
          (labelPosition === "auto" && !isSmallSlice)

        // Small slices without space for label always show tooltip
        const shouldShowTooltip =
          showTooltipByConfig ||
          (isSmallSlice && !shouldShowInside && !shouldShowOutside)

        /* Outside label */
        const renderOutsideLabel = () => {
          const angleOffset = angle - Math.PI / 2
          const side = Math.cos(angleOffset) >= 0 ? 1 : -1

          const startX = Math.cos(angleOffset) * radius
          const startY = Math.sin(angleOffset) * radius
          const labelRadius = radius * 1.25
          const verticalOffset = i * 12 * side

          const endX = Math.cos(angleOffset) * labelRadius
          const endY = Math.sin(angleOffset) * labelRadius + verticalOffset
          const textX = endX + side * 12
          const anchor = side > 0 ? "start" : "end"

          return svg`
            <g>
              <line x1=${startX} y1=${startY} x2=${endX} y2=${endY} stroke="#999" stroke-width="1"/>
              <text x=${textX} y=${endY - 6} text-anchor=${anchor} font-size="12" fill="#333" font-weight="500">${label}</text>
              <text x=${textX} y=${endY + 8} text-anchor=${anchor} font-size="10" fill="#777">${formatNumber(percentage)}%</text>
            </g>
          `
        }

        /* Inside label */
        const renderInsideLabel = () => {
          const labelRadius = radius * (sliceSize > Math.PI / 3 ? 0.55 : 0.75)
          const angleOffset = angle - Math.PI / 2
          const x = Math.cos(angleOffset) * labelRadius
          const y = Math.sin(angleOffset) * labelRadius
          const percentageColor = isDarkColor(color) ? "#fff" : "#444"

          return svg`
            <g>
              <text x=${x} y=${y} text-anchor="middle" font-size="12" fill="#333" font-weight="500">${label}</text>
              <text x=${x} y=${y + 14} text-anchor="middle" font-size="10" fill=${percentageColor} font-weight="500">${formatNumber(percentage)}%</text>
            </g>
          `
        }

        // Determine if the label should be shown based on the minimum percentage
        const minPercentage = shouldShowOutside ? 3 : 5
        const shouldShowLabel = percentage > minPercentage

        return svg`
          <g transform="translate(${centerX}, ${centerY})">
            <path
              d=${generateArcPath(0, radius, d.startAngle, d.endAngle)}
              fill=${color}
              class="iw-chart-pie-slice"
              stroke="#fff"
              stroke-width="2"
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
                const labelRadius = radius * 1.1
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
            >
            </path>

            ${shouldShowLabel && shouldShowOutside ? renderOutsideLabel() : ""}
            ${shouldShowLabel && shouldShowInside ? renderInsideLabel() : ""}
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

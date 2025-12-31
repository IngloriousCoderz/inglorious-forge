/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { when } from "lit-html/directives/when.js"

import { renderPie } from "../shape/pie.js"
import { formatNumber } from "../utils/format.js"
import { calculatePieData } from "../utils/paths.js"

export const pie = {
  renderChart(entity, api) {
    if (!entity.data || entity.data.length === 0) {
      return svg`<svg>...</svg>`
    }

    // dataKey and nameKey: like Recharts (flexible data access)
    const dataKey = entity.dataKey ?? ((d) => d.value)
    const nameKey = entity.nameKey ?? ((d) => d.label || d.name || "")

    // startAngle, endAngle, paddingAngle, minAngle: like Recharts
    const startAngle = entity.startAngle ?? 0
    const endAngle = entity.endAngle ?? 360
    const paddingAngle = entity.paddingAngle ?? 0
    const minAngle = entity.minAngle ?? 0

    const pieData = calculatePieData(
      entity.data,
      dataKey,
      startAngle,
      endAngle,
      paddingAngle,
      minAngle,
    )

    const labelPosition = entity.labelPosition ?? "outside"

    const outerPadding =
      entity.outerPadding ??
      (labelPosition === "tooltip"
        ? 50
        : labelPosition === "inside"
          ? 20
          : 60)

    // outerRadius: like Recharts (default calculated from dimensions)
    const outerRadius =
      entity.outerRadius ??
      Math.min(entity.width, entity.height) / 2 - outerPadding

    // innerRadius: like Recharts (default 0 for pie chart)
    const innerRadius = entity.innerRadius ?? 0

    const offsetRadius = entity.offsetRadius ?? 20

    // cx and cy: like Recharts (custom center position)
    const centerX = entity.cx
      ? typeof entity.cx === "string"
        ? (parseFloat(entity.cx) / 100) * entity.width
        : entity.cx
      : entity.width / 2

    const centerY = entity.cy
      ? typeof entity.cy === "string"
        ? (parseFloat(entity.cy) / 100) * entity.height
        : entity.cy
      : entity.height / 2

    // cornerRadius: like Recharts (rounded edges)
    const cornerRadius = entity.cornerRadius ?? 0

    const slices = renderPie({
      pieData,
      outerRadius,
      innerRadius,
      centerX,
      centerY,
      colors: entity.colors,
      labelPosition,
      showLabel: entity.showLabel ?? true,
      offsetRadius,
      minLabelPercentage: entity.minLabelPercentage,
      labelOverflowMargin: entity.labelOverflowMargin,
      cornerRadius,
      nameKey,
      width: entity.width,
      height: entity.height,
      onSliceEnter: (slice, index, event) => {
        if (!entity.showTooltip) return

        const path = event.target
        const svgEl = path.closest("svg")
        const rect = svgEl.getBoundingClientRect()
        const angle = (slice.startAngle + slice.endAngle) / 2
        const angleOffset = angle - Math.PI / 2
        const labelRadius = outerRadius * 1.1
        const x = centerX + Math.cos(angleOffset) * labelRadius
        const y = centerY + Math.sin(angleOffset) * labelRadius
        // Use absolute value to handle both clockwise and counter-clockwise slices
        const percentage =
          (Math.abs(slice.endAngle - slice.startAngle) / (2 * Math.PI)) * 100

        // Use nameKey to get label
        const label = nameKey(slice.data)

        api.notify(`#${entity.id}:showTooltip`, {
          label,
          percentage,
          value: slice.value,
          color:
            slice.data.color || entity.colors[index % entity.colors.length],
          x: rect.left + x,
          y: rect.top + y,
        })
      },
      onSliceLeave: () => {
        api.notify(`#${entity.id}:hideTooltip`)
      },
    })

    return html`
      <div class="iw-chart">
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

        ${when(
          entity.tooltip,
          () => html`
            <div
              class="iw-chart-modal"
              style="left:${entity.tooltipX}px; top:${entity.tooltipY}px"
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


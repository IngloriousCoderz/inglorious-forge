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

    const pieData = calculatePieData(entity.data)
    const sliceCount = entity.data.length

    let labelPosition = entity.labelPosition === "auto" || !entity.labelPosition 
      ? "outside" 
      : entity.labelPosition

    const canShowOutsideLabels =
      labelPosition === "outside" &&
      (sliceCount <= 15 || Math.min(entity.width, entity.height) >= 500)

    const effectiveLabelPosition = canShowOutsideLabels 
      ? "outside" 
      : labelPosition === "outside" 
        ? "tooltip" 
        : labelPosition
    labelPosition = effectiveLabelPosition

    const dynamicOuterPadding =
      labelPosition === "tooltip"
        ? 50
        : labelPosition === "inside"
          ? 20
          : Math.min(
              Math.max(sliceCount * 6, 60), // cresce com nº de slices (mínimo 60px)
              Math.min(entity.width, entity.height) / 2 - 20, // nunca maior que metade do SVG menos 20px
            )

    const radius =
      Math.min(entity.width, entity.height) / 2 - dynamicOuterPadding

    const centerX = entity.width / 2
    const centerY = entity.height / 2

    const slices = renderPie({
      pieData,
      radius,
      centerX,
      centerY,
      colors: entity.colors,
      labelPosition,
      showLabel: true,
      width: entity.width,
      height: entity.height,
      onSliceEnter: (slice, index, event) => {
        if (!entity.showTooltip) return
        
        const path = event.target
        const svgEl = path.closest("svg")
        const rect = svgEl.getBoundingClientRect()
        const angle = (slice.startAngle + slice.endAngle) / 2
        const angleOffset = angle - Math.PI / 2
        const labelRadius = radius * 1.1
        const x = centerX + Math.cos(angleOffset) * labelRadius
        const y = centerY + Math.sin(angleOffset) * labelRadius
        const percentage = ((slice.endAngle - slice.startAngle) / (2 * Math.PI)) * 100

        api.notify(`#${entity.id}:showTooltip`, {
          label: slice.data.label || slice.data.name || "",
          percentage,
          value: slice.value,
          color: slice.data.color || entity.colors[index % entity.colors.length],
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
                <span class="iw-chart-modal-label">${entity.tooltip.label}</span>
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

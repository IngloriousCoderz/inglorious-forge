/* eslint-disable no-magic-numbers */

import { html, svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"
import { when } from "lit-html/directives/when.js"

import { renderSector } from "../shape/sector.js"
import { formatNumber } from "../utils/data-utils.js"
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
      (labelPosition === "tooltip" ? 50 : labelPosition === "inside" ? 20 : 60)

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

    const slices = renderPieSectors({
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
      labelPositions: null,
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

/**
 * Calculates ordered Y positions for external labels, avoiding overlap
 * Similar to Recharts label positioning logic
 */
function calculateLabelPositions(
  pieData,
  outerRadius,
  width,
  height,
  offsetRadius,
) {
  const positions = new Map()
  const minSpacing = 14
  const maxY = height / 2 - 10
  const minY = -height / 2 + 10

  // Separate slices by side (left/right)
  const rightSlices = []
  const leftSlices = []

  pieData.forEach((slice, i) => {
    const angle = (slice.startAngle + slice.endAngle) / 2 - Math.PI / 2
    const side = Math.cos(angle) >= 0 ? 1 : -1
    const baseY = Math.sin(angle) * (outerRadius + offsetRadius)

    if (side > 0) {
      rightSlices.push({ index: i, angle, baseY })
    } else {
      leftSlices.push({ index: i, angle, baseY })
    }
  })

  // Sort by Y (top to bottom)
  rightSlices.sort((a, b) => a.baseY - b.baseY)
  leftSlices.sort((a, b) => a.baseY - b.baseY)

  // Calculate adjusted positions for right side
  let currentY = minY
  rightSlices.forEach(({ index, baseY }) => {
    const adjustedY = Math.max(currentY, Math.min(maxY, baseY))
    positions.set(index, adjustedY)
    currentY = adjustedY + minSpacing
  })

  // Calculate adjusted positions for left side
  currentY = minY
  leftSlices.forEach(({ index, baseY }) => {
    const adjustedY = Math.max(currentY, Math.min(maxY, baseY))
    positions.set(index, adjustedY)
    currentY = adjustedY + minSpacing
  })

  return positions
}

/**
 * Renders pie sectors using Sector primitives
 * Similar to Recharts Pie component
 */
export function renderPieSectors({
  pieData,
  outerRadius,
  innerRadius,
  centerX,
  centerY,
  colors,
  labelPosition,
  showLabel,
  offsetRadius,
  minLabelPercentage,
  labelOverflowMargin,
  cornerRadius,
  nameKey,
  onSliceEnter,
  onSliceLeave,
  width,
  height,
  labelPositions: providedLabelPositions,
}) {
  const labelPositions =
    labelPosition === "outside" && !providedLabelPositions
      ? calculateLabelPositions(
          pieData,
          outerRadius,
          width,
          height,
          offsetRadius,
        )
      : providedLabelPositions

  return svg`
    ${repeat(
      pieData,
      (_, i) => i,
      (slice, i) => {
        // Use absolute value to handle both clockwise and counter-clockwise slices
        const sliceSize = Math.abs(slice.endAngle - slice.startAngle)
        const percentage = (sliceSize / (2 * Math.PI)) * 100

        // Use user-controlled minLabelPercentage or default
        const minPercentage = minLabelPercentage ?? 2
        const shouldShowLabel = showLabel && percentage > minPercentage

        const color = slice.data.color || colors[i % colors.length]

        return svg`
          ${renderSector({
            innerRadius,
            outerRadius,
            startAngle: slice.startAngle,
            endAngle: slice.endAngle,
            centerX,
            centerY,
            fill: color,
            className: "iw-chart-pie-slice",
            cornerRadius: cornerRadius ?? 0,
            dataIndex: i,
            onMouseEnter: (e) => onSliceEnter?.(slice, i, e),
            onMouseLeave: () => onSliceLeave?.(),
          })}
          ${
            shouldShowLabel
              ? renderLabel({
                  slice,
                  outerRadius,
                  percentage,
                  labelPosition,
                  pieData,
                  index: i,
                  color,
                  offsetRadius,
                  labelOverflowMargin,
                  nameKey,
                  labelPositions,
                  width,
                  height,
                  centerX,
                  centerY,
                })
              : ""
          }
        `
      },
    )}
  `
}

// Label rendering functions
function renderLabel(params) {
  const { labelPosition } = params

  // If "tooltip", don't show label (only tooltip)
  if (labelPosition === "tooltip") return svg``

  // If "inside", show internal label
  if (labelPosition === "inside") return renderInsideLabel(params)

  // For "outside", "auto" or any other value, show external label (default)
  return renderOutsideLabel(params)
}

function renderOutsideLabel({
  slice,
  outerRadius,
  percentage,
  index,
  offsetRadius,
  labelOverflowMargin,
  nameKey,
  labelPositions,
  width,
  height,
  centerX,
  centerY,
}) {
  const angle = (slice.startAngle + slice.endAngle) / 2 - Math.PI / 2
  const side = Math.cos(angle) >= 0 ? 1 : -1

  const startX = Math.cos(angle) * outerRadius
  const startY = Math.sin(angle) * outerRadius
  const midX = Math.cos(angle) * (outerRadius + offsetRadius)

  const baseMidY = Math.sin(angle) * (outerRadius + offsetRadius)
  const midY = labelPositions?.get(index) ?? baseMidY

  const endX = midX + side * 25
  const endY = midY

  const textX = endX + side * 8
  const anchor = side > 0 ? "start" : "end"

  const margin = labelOverflowMargin ?? 20
  const minX = -width / 2 - margin
  const maxX = width / 2 + margin
  const minY = -height / 2 - margin
  const maxY = height / 2 + margin

  if (textX < minX || textX > maxX || endY < minY || endY > maxY) {
    return svg``
  }

  const clampedEndX = Math.max(minX, Math.min(maxX, endX))
  const clampedTextX = clampedEndX + side * 8

  const labelText = nameKey ? nameKey(slice.data) : slice.data.label || ""

  return svg`
    <g transform="translate(${centerX}, ${centerY})">
      <path
        d="M${startX},${startY}L${midX},${midY}L${clampedEndX},${endY}"
        stroke="#999"
        fill="none"
      />
      <circle cx=${clampedEndX} cy=${endY} r="2" fill="#999" />
      <text x=${clampedTextX} y=${endY - 6} text-anchor=${anchor}
        font-size="0.75em" fill="#333" font-weight="500">
        ${labelText}
      </text>
      <text x=${clampedTextX} y=${endY + 8} text-anchor=${anchor}
        font-size="0.625em" fill="#777">
        ${formatNumber(percentage)}%
      </text>
    </g>
  `
}

function renderInsideLabel({ slice, outerRadius, percentage, nameKey, color }) {
  // Use absolute value to handle both clockwise and counter-clockwise slices
  const sliceSize = Math.abs(slice.endAngle - slice.startAngle)
  const labelRadius = outerRadius * (sliceSize > Math.PI / 3 ? 0.55 : 0.75)
  const angle = (slice.startAngle + slice.endAngle) / 2 - Math.PI / 2

  const x = Math.cos(angle) * labelRadius
  const y = Math.sin(angle) * labelRadius

  const labelText = nameKey ? nameKey(slice.data) : slice.data.label || ""
  const textColor = isDarkColor(color) ? "#fff" : "#444"

  return svg`
    <g>
      <text x=${x} y=${y} text-anchor="middle"
        font-size="0.75em" fill="#333" font-weight="500">
        ${labelText}
      </text>
      <text x=${x} y=${y + 14} text-anchor="middle"
        font-size="0.625em" fill=${textColor}>
        ${formatNumber(percentage)}%
      </text>
    </g>
  `
}

function isDarkColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { formatNumber } from "../utils/format.js"
import { generateArcPath } from "../utils/paths.js"

export function renderPie({
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
}) {
  const labelPositions =
    labelPosition === "outside"
      ? calculateLabelPositions(
          pieData,
          outerRadius,
          width,
          height,
          offsetRadius,
        )
      : null

  return svg`
    ${repeat(
      pieData,
      (_, i) => i,
      (slice, i) =>
        renderPieSlice({
          slice,
          index: i,
          outerRadius,
          innerRadius,
          centerX,
          centerY,
          color: slice.data.color || colors[i % colors.length],
          labelPosition,
          showLabel,
          pieData,
          offsetRadius,
          minLabelPercentage,
          labelOverflowMargin,
          cornerRadius,
          nameKey,
          onSliceEnter,
          onSliceLeave,
          labelPositions,
        }),
    )}
  `
}

function renderPieSlice({
  slice,
  index,
  outerRadius,
  innerRadius,
  centerX,
  centerY,
  color,
  labelPosition,
  showLabel,
  pieData,
  offsetRadius,
  minLabelPercentage,
  labelOverflowMargin,
  cornerRadius,
  nameKey,
  onSliceEnter,
  onSliceLeave,
  labelPositions,
}) {
  // Use absolute value to handle both clockwise and counter-clockwise slices
  const sliceSize = Math.abs(slice.endAngle - slice.startAngle)
  const percentage = (sliceSize / (2 * Math.PI)) * 100

  // Use user-controlled minLabelPercentage or default
  const minPercentage = minLabelPercentage ?? 2
  const shouldShowLabel = showLabel && percentage > minPercentage

  return svg`
    <g transform="translate(${centerX}, ${centerY})">
      <path
        d=${generateArcPath(
          innerRadius,
          outerRadius,
          slice.startAngle,
          slice.endAngle,
          cornerRadius ?? 0,
        )}
        fill=${color}
        class="iw-chart-pie-slice"
        data-slice-index=${index}
        @mouseenter=${(e) => onSliceEnter?.(slice, index, e)}
        @mouseleave=${() => onSliceLeave?.()}
      />
      ${
        shouldShowLabel
          ? renderLabel({
              slice,
              outerRadius,
              percentage,
              labelPosition,
              pieData,
              index,
              color,
              offsetRadius,
              labelOverflowMargin,
              nameKey,
              labelPositions,
              width: centerX * 2,
              height: centerY * 2,
            })
          : ""
      }
    </g>
  `
}

/* ===============================
   Labels
================================ */

function renderLabel(params) {
  const { labelPosition } = params

  // If "tooltip", don't show label (only tooltip)
  if (labelPosition === "tooltip") return svg``

  // If "inside", show internal label
  if (labelPosition === "inside") return renderInsideLabel(params)

  // For "outside", "auto" or any other value, show external label (default)
  return renderOutsideLabel(params)
}

/**
 * Calculates ordered Y positions for external labels, avoiding overlap
 * @param {any[]} pieData
 * @param {number} outerRadius
 * @param {number} width
 * @param {number} height
 * @param {number} offsetRadius
 * @returns {Map<number, number>} Map<index, adjustedY>
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

  return svg`
    <g>
      <path
        d="M${startX},${startY}L${midX},${midY}L${clampedEndX},${endY}"
        stroke="#999"
        fill="none"
      />
      <circle cx=${clampedEndX} cy=${endY} r="2" fill="#999" />
      <text x=${clampedTextX} y=${endY - 6} text-anchor=${anchor}
        font-size="0.75em" fill="#333" font-weight="500">
        ${nameKey ? nameKey(slice.data) : slice.data.label || ""}
      </text>
      <text x=${clampedTextX} y=${endY + 8} text-anchor=${anchor}
        font-size="0.625em" fill="#777">
        ${formatNumber(percentage)}%
      </text>
    </g>
  `
}

function renderInsideLabel({ slice, outerRadius, percentage, nameKey }) {
  // Use absolute value to handle both clockwise and counter-clockwise slices
  const sliceSize = Math.abs(slice.endAngle - slice.startAngle)
  const labelRadius = outerRadius * (sliceSize > Math.PI / 3 ? 0.55 : 0.75)
  const angle = (slice.startAngle + slice.endAngle) / 2 - Math.PI / 2

  const x = Math.cos(angle) * labelRadius
  const y = Math.sin(angle) * labelRadius

  return svg`
    <g>
      <text x=${x} y=${y} text-anchor="middle"
        font-size="0.75em" fill="#333" font-weight="500">
        ${nameKey ? nameKey(slice.data) : slice.data.label || ""}
      </text>
      <text x=${x} y=${y + 14} text-anchor="middle"
        font-size="0.625em" fill="#fff">
        ${formatNumber(percentage)}%
      </text>
    </g>
  `
}

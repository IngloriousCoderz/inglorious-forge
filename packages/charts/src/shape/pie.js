/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { formatNumber } from "../utils/format.js"
import { generateArcPath } from "../utils/paths.js"

export function renderPie({
  pieData,
  radius,
  centerX,
  centerY,
  colors,
  labelPosition,
  showLabel,
  onSliceEnter,
  onSliceLeave,
  width,
  height,
}) {
  const labelPositions = labelPosition === "outside" 
    ? calculateLabelPositions(pieData, radius, width, height)
    : null

  return svg`
    ${repeat(
      pieData,
      (_, i) => i,
      (slice, i) =>
        renderPieSlice({
          slice,
          index: i,
          radius,
          centerX,
          centerY,
          color: slice.data.color || colors[i % colors.length],
          labelPosition,
          showLabel,
          pieData,
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
  radius,
  centerX,
  centerY,
  color,
  labelPosition,
  showLabel,
  pieData,
  onSliceEnter,
  onSliceLeave,
  labelPositions, // Posições calculadas para evitar sobreposição
}) {
  const sliceSize = slice.endAngle - slice.startAngle
  const percentage = (sliceSize / (2 * Math.PI)) * 100
  
  // Ajusta minPercentage baseado no número de slices
  // Mais slices = maior threshold para evitar sobreposição
  const minPercentage = pieData.length > 15 ? 5 : pieData.length > 10 ? 3 : 2
  const shouldShowLabel = showLabel && percentage > minPercentage

  return svg`
    <g transform="translate(${centerX}, ${centerY})">
      <path
        d=${generateArcPath(0, radius, slice.startAngle, slice.endAngle)}
        fill=${color}
        class="iw-chart-pie-slice"
        data-slice-index=${index}
        @mouseenter=${(e) => onSliceEnter?.(slice, index, e)}
        @mouseleave=${() => onSliceLeave?.()}
      />
      ${shouldShowLabel
        ? renderLabel({
            slice,
            radius,
            percentage,
            labelPosition,
            pieData,
            index,
            color,
            labelPositions,
            width: centerX * 2,
            height: centerY * 2,
          })
        : ""}
    </g>
  `
}

/* ===============================
   Labels
================================ */

function renderLabel(params) {
  const { labelPosition } = params
  
  // Se for "tooltip", não mostra label (só tooltip)
  if (labelPosition === "tooltip") return svg``
  
  // Se for "inside", mostra label interno
  if (labelPosition === "inside") return renderInsideLabel(params)
  
  // Para "outside", "auto" ou qualquer outro valor, mostra label externo (padrão)
  return renderOutsideLabel(params)
}


/**
 * Calcula posições Y ordenadas para labels externos, evitando sobreposição
 * @param {any[]} pieData
 * @param {number} radius
 * @param {number} width
 * @param {number} height
 * @returns {Map<number, number>} Map<index, adjustedY>
 */
function calculateLabelPositions(pieData, radius, width, height) {
  const positions = new Map()
  const minSpacing = 14 // Espaçamento mínimo entre labels (em pixels)
  const maxY = height / 2 - 10
  const minY = -height / 2 + 10

  // Separa slices por lado (esquerdo/direito)
  const rightSlices = []
  const leftSlices = []

  pieData.forEach((slice, i) => {
    const angle = (slice.startAngle + slice.endAngle) / 2 - Math.PI / 2
    const side = Math.cos(angle) >= 0 ? 1 : -1
    const baseY = Math.sin(angle) * (radius + 15)

    if (side > 0) {
      rightSlices.push({ index: i, angle, baseY })
    } else {
      leftSlices.push({ index: i, angle, baseY })
    }
  })

  // Ordena por Y (de cima para baixo)
  rightSlices.sort((a, b) => a.baseY - b.baseY)
  leftSlices.sort((a, b) => a.baseY - b.baseY)

  // Calcula posições ajustadas para lado direito
  let currentY = minY
  rightSlices.forEach(({ index, baseY }) => {
    const adjustedY = Math.max(currentY, Math.min(maxY, baseY))
    positions.set(index, adjustedY)
    currentY = adjustedY + minSpacing
  })

  // Calcula posições ajustadas para lado esquerdo
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
  radius, 
  percentage, 
  index, 
  labelPositions,
  width,
  height,
}) {
  const angle = (slice.startAngle + slice.endAngle) / 2 - Math.PI / 2
  const side = Math.cos(angle) >= 0 ? 1 : -1

  const startX = Math.cos(angle) * radius
  const startY = Math.sin(angle) * radius
  const midX = Math.cos(angle) * (radius + 15)
  
  const baseMidY = Math.sin(angle) * (radius + 15)
  const midY = labelPositions?.get(index) ?? baseMidY
  
  const endX = midX + side * 25
  const endY = midY

  const textX = endX + side * 8
  const anchor = side > 0 ? "start" : "end"

  const margin = 20
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
        ${slice.data.label || ""}
      </text>
      <text x=${clampedTextX} y=${endY + 8} text-anchor=${anchor}
        font-size="0.625em" fill="#777">
        ${formatNumber(percentage)}%
      </text>
    </g>
  `
}

function renderInsideLabel({ slice, radius, percentage }) {
  const sliceSize = slice.endAngle - slice.startAngle
  const labelRadius = radius * (sliceSize > Math.PI / 3 ? 0.55 : 0.75)
  const angle = (slice.startAngle + slice.endAngle) / 2 - Math.PI / 2

  const x = Math.cos(angle) * labelRadius
  const y = Math.sin(angle) * labelRadius

  return svg`
    <g>
      <text x=${x} y=${y} text-anchor="middle"
        font-size="0.75em" fill="#333" font-weight="500">
        ${slice.data.label || ""}
      </text>
      <text x=${x} y=${y + 14} text-anchor="middle"
        font-size="0.625em" fill="#fff">
        ${formatNumber(percentage)}%
      </text>
    </g>
  `
}

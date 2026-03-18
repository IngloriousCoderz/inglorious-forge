/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { line as createLinePath } from "d3-shape"

import { maximumValue, minimumValue, resolveLegendItems } from "./shared.js"

export function renderLegend(component, frame) {
  const items = resolveLegendItems(component, frame)
  const startX = frame.dimensions.plotLeft
  const y = frame.dimensions.padding.top + 12

  return svg`
    <g class="iw-chart-legend">
      ${items.map(
        (item, index) => svg`
          <g transform="translate(${startX + index * 130}, ${y})">
            <circle cx="0" cy="0" r="5" fill=${item.color} />
            <text x="12" y="4" fill="#475569" font-size="12">${item.label}</text>
          </g>
        `,
      )}
    </g>
  `
}

export function renderBrush(component, frame) {
  const { entity, dimensions } = frame
  if (
    !entity.brush?.enabled ||
    entity.brush?.visible === false ||
    !Array.isArray(entity.fullData)
  ) {
    return svg``
  }

  const dataKey =
    component.props?.dataKey ||
    frame.scales.plottedKeys?.[0] ||
    entity.seriesKeys?.[0]

  if (!dataKey) return svg``

  const brushWidth = dimensions.plotWidth
  const brushHeight = component.props?.height || entity.brush.height || 30
  const xStep =
    entity.fullData.length > 1
      ? brushWidth / (entity.fullData.length - 1)
      : brushWidth
  const previewMin = minimumValue(entity.fullData, dataKey)
  const previewMax = maximumValue(entity.fullData, dataKey)
  const previewRange = previewMax - previewMin || 1
  const previewPath = createLinePath()
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y((point) => point.y)
  const previewPoints = entity.fullData.map((row, index) => ({
    x: dimensions.plotLeft + xStep * index,
    y:
      dimensions.brushTop +
      brushHeight -
      (((row?.[dataKey] ?? 0) - previewMin) / previewRange) * brushHeight,
  }))
  const startRatio =
    entity.fullData.length > 1
      ? entity.brush.startIndex / (entity.fullData.length - 1)
      : 0
  const endRatio =
    entity.fullData.length > 1
      ? entity.brush.endIndex / (entity.fullData.length - 1)
      : 1
  const selectionX = dimensions.plotLeft + brushWidth * startRatio
  const selectionWidth = Math.max(12, brushWidth * (endRatio - startRatio))

  return svg`
    <g class="iw-chart-brush">
      <rect
        x=${dimensions.plotLeft}
        y=${dimensions.brushTop}
        width=${brushWidth}
        height=${brushHeight}
        fill="#f8fafc"
        stroke="#cbd5e1"
      />
      <path
        d=${previewPath(previewPoints) || ""}
        fill="none"
        stroke="#94a3b8"
        stroke-width="1.5"
      />
      <rect
        x=${selectionX}
        y=${dimensions.brushTop}
        width=${selectionWidth}
        height=${brushHeight}
        fill="rgba(59, 130, 246, 0.16)"
        stroke="#3b82f6"
      />
    </g>
  `
}

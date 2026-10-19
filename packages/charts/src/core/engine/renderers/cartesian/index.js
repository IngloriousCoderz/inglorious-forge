/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { area as createAreaPath, line as createLinePath } from "d3-shape"

import {
  canShowTooltip,
  createSeriesPoints,
  getBarGroupWidth,
  getCategoryX,
  getTooltipBindings,
  getTooltipText,
  renderHoverTargets,
  resolveSeriesColor,
} from "./shared.js"

export function renderLineSeries(primitive, frame) {
  const dataKey = primitive.props?.dataKey
  const stroke = primitive.props?.stroke || resolveSeriesColor(frame, dataKey)
  const series = createSeriesPoints(primitive, frame)
  const linePath = createLinePath()
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y((point) => point.y)

  return svg`
    <g class="iw-chart-line">
      <path
        d=${linePath(series) || ""}
        fill="none"
        stroke=${stroke}
        stroke-width=${primitive.props?.strokeWidth || 3}
      />
      ${primitive.props?.hasDots ? renderDots(primitive, frame) : ""}
      ${
        canShowTooltip(primitive, frame) && !primitive.props?.hasDots
          ? renderHoverTargets(primitive, frame)
          : ""
      }
    </g>
  `
}

export function renderAreaSeries(primitive, frame) {
  const dataKey = primitive.props?.dataKey
  const fill = primitive.props?.fill || resolveSeriesColor(frame, dataKey)
  const stroke = primitive.props?.stroke || fill
  const fillOpacity = primitive.props?.fillOpacity ?? 0.3
  const series = createSeriesPoints(primitive, frame)
  const areaPath = createAreaPath()
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y0((point) => point.y0)
    .y1((point) => point.y)
  const linePath = createLinePath()
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y((point) => point.y)

  return svg`
    <g class="iw-chart-area">
      <path d=${areaPath(series) || ""} fill=${fill} fill-opacity=${fillOpacity} />
      <path
        d=${linePath(series) || ""}
        fill="none"
        stroke=${stroke}
        stroke-width=${primitive.props?.strokeWidth || 3}
      />
      ${primitive.props?.hasDots ? renderDots(primitive, frame) : ""}
      ${
        canShowTooltip(primitive, frame) && !primitive.props?.hasDots
          ? renderHoverTargets(primitive, frame)
          : ""
      }
    </g>
  `
}

export function renderBarSeries(primitive, frame) {
  const { entity, scales } = frame
  const dataKey = primitive.props?.dataKey
  const fill = primitive.props?.fill || resolveSeriesColor(frame, dataKey)
  const { barWidth, groupStart } = getBarGeometry(primitive, frame)

  return svg`
    <g class="iw-chart-bar">
      ${entity.data.map((row, index) => {
        const value = Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0
        const x = getCategoryX(scales, index) + groupStart
        const y = value >= 0 ? scales.yScale(value) : scales.yScale(0)
        const baseY = value >= 0 ? scales.yScale(0) : scales.yScale(value)
        const tooltip = getTooltipBindings(
          frame,
          primitive,
          { index, dataKey },
          getTooltipText(entity, row, dataKey),
        )

        return svg`
          <rect
            x=${x}
            y=${Math.min(y, baseY)}
            width=${barWidth}
            height=${Math.abs(baseY - y)}
            fill=${fill}
            pointer-events="all"
            style=${
              canShowTooltip(primitive, frame) ? "cursor: pointer;" : undefined
            }
            @mouseenter=${tooltip.onEnter}
            @mouseleave=${tooltip.onLeave}
          >
            ${tooltip.title}
          </rect>
        `
      })}
    </g>
  `
}

export function renderDots(primitive, frame) {
  const dataKey = primitive.props?.dataKey
  const fill = primitive.props?.fill || resolveSeriesColor(frame, dataKey)
  const stroke = primitive.props?.stroke || resolveSeriesColor(frame, dataKey)
  const strokeWidth = primitive.props?.strokeWidth ?? 2
  const radius = primitive.props?.r || 4
  const points = createSeriesPoints(primitive, frame).filter((point) =>
    Number.isFinite(point.y),
  )

  return svg`
    <g class="iw-chart-dots">
      ${points.map((point) => {
        const tooltip = getTooltipBindings(
          frame,
          primitive,
          { index: point.index, dataKey },
          getTooltipText(frame.entity, point.row, dataKey),
        )

        return svg`
          <circle
            cx=${point.x}
            cy=${point.y}
            r=${radius}
            fill=${fill}
            stroke=${stroke}
            stroke-width=${strokeWidth}
            pointer-events="all"
            style=${
              canShowTooltip(primitive, frame) ? "cursor: pointer;" : undefined
            }
            @mouseenter=${tooltip.onEnter}
            @mouseleave=${tooltip.onLeave}
          >
            ${tooltip.title}
          </circle>
        `
      })}
    </g>
  `
}

/**
 * Where the tooltip for a hovered datum points: the top of its bar, or its
 * point on the line or area. Null when the datum is not drawn.
 */
export function getCartesianTooltipAnchor(frame, { index, dataKey }) {
  const series = frame.primitives.find(
    (item) =>
      ["line", "area", "bar", "dots"].includes(item.type) &&
      item.props?.dataKey === dataKey,
  )
  if (!series || !frame.entity.data[index]) return null

  if (series.type === "bar") {
    const value = frame.entity.data[index][dataKey]
    if (!Number.isFinite(value)) return null
    const { barWidth, groupStart } = getBarGeometry(series, frame)
    return {
      x: getCategoryX(frame.scales, index) + groupStart + barWidth / 2,
      y: frame.scales.yScale(Math.max(0, value)),
    }
  }

  const point = createSeriesPoints(series, frame)[index]
  return Number.isFinite(point?.y) ? { x: point.x, y: point.y } : null
}

// Bars of several series share each category, side by side. They always fit
// within it: with many categories they get thin rather than overlapping.
function getBarGeometry(primitive, frame) {
  const barPrimitives = frame.primitives.filter((item) => item.type === "bar")
  const barIndex = barPrimitives.indexOf(primitive)
  const groupWidth = getBarGroupWidth(frame)
  const barWidth = groupWidth / Math.max(1, barPrimitives.length)
  return { barWidth, groupStart: -groupWidth / 2 + barWidth * barIndex }
}

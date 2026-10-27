/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import {
  area as createAreaPath,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  line as createLinePath,
} from "d3-shape"

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

/** How a line or area runs between its points, by the name its `curve` prop gives. */
const CURVES = {
  linear: curveLinear,
  monotone: curveMonotoneX,
  natural: curveNatural,
  step: curveStep,
}

function curveOf(primitive) {
  return CURVES[primitive.props?.curve] ?? curveLinear
}

export function renderLineSeries(primitive, frame) {
  const dataKey = primitive.props?.dataKey
  const stroke = primitive.props?.stroke || resolveSeriesColor(frame, dataKey)
  const series = createSeriesPoints(primitive, frame)
  const linePath = createLinePath()
    .curve(curveOf(primitive))
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
      ${when(primitive.props?.hasDots, () => renderDots(primitive, frame))}
      ${when(
        canShowTooltip(primitive, frame) && !primitive.props?.hasDots,
        () => renderHoverTargets(primitive, frame),
      )}
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
    .curve(curveOf(primitive))
    .defined((point) => Number.isFinite(point.y))
    .x((point) => point.x)
    .y0((point) => point.y0)
    .y1((point) => point.y)
  const linePath = createLinePath()
    .curve(curveOf(primitive))
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
      ${when(primitive.props?.hasDots, () => renderDots(primitive, frame))}
      ${when(
        canShowTooltip(primitive, frame) && !primitive.props?.hasDots,
        () => renderHoverTargets(primitive, frame),
      )}
    </g>
  `
}

export function renderBarSeries(primitive, frame) {
  const { entity, scales } = frame
  const dataKey = primitive.props?.dataKey
  const fill = primitive.props?.fill || resolveSeriesColor(frame, dataKey)
  const { barWidth, groupStart } = getBarGeometry(primitive, frame)
  // A stacked bar starts where the bars below it in its stack end.
  const stacked = primitive.props?.stackId
    ? createSeriesPoints(primitive, frame)
    : null

  return svg`
    <g class="iw-chart-bar">
      ${entity.data.map((row, index) => {
        const value = Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0
        const start = getCategoryX(scales, index) + groupStart
        const point = stacked?.[index]
        // Where the bar ends and where it starts on the value axis.
        const end = point
          ? Number.isFinite(point.y)
            ? point.y
            : point.y0
          : scales.yScale(Math.max(0, value))
        const base = point ? point.y0 : scales.yScale(Math.min(0, value))
        const length = Math.abs(base - end)
        const tooltip = getTooltipBindings(
          frame,
          primitive,
          { index, dataKey },
          getTooltipText(frame, row, dataKey),
        )

        return svg`
          <rect
            x=${scales.isHorizontal ? Math.min(base, end) : start}
            y=${scales.isHorizontal ? start : Math.min(base, end)}
            width=${scales.isHorizontal ? length : barWidth}
            height=${scales.isHorizontal ? barWidth : length}
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
          getTooltipText(frame, point.row, dataKey),
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
    const end = series.props?.stackId
      ? createSeriesPoints(series, frame)[index].y
      : frame.scales.yScale(Math.max(0, value))
    const middle = getCategoryX(frame.scales, index) + groupStart + barWidth / 2
    return frame.scales.isHorizontal
      ? { x: end, y: middle }
      : { x: middle, y: end }
  }

  const point = createSeriesPoints(series, frame)[index]
  return Number.isFinite(point?.y) ? { x: point.x, y: point.y } : null
}

// Bars of several series share each category, side by side, except that the
// bars of one stack share a single place, one on top of the other. They
// always fit within the category: with many categories they get thin rather
// than overlapping.
function getBarGeometry(primitive, frame) {
  const slots = []
  frame.primitives
    .filter((item) => item.type === "bar")
    .forEach((item) => {
      const slot = item.props?.stackId ?? item
      if (!slots.includes(slot)) slots.push(slot)
    })
  const slotIndex = slots.indexOf(primitive.props?.stackId ?? primitive)
  const groupWidth = getBarGroupWidth(frame)
  const barWidth = groupWidth / Math.max(1, slots.length)
  return { barWidth, groupStart: -groupWidth / 2 + barWidth * slotIndex }
}

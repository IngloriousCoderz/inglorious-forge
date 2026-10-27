/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { unsafeSVG } from "@inglorious/web/directives/unsafe-svg"

// Escapes text for safe inclusion in raw SVG markup.
export function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

// Invisible targets on a line's or area's points, so hovering near one shows
// its tooltip.
export function renderHoverTargets(primitive, frame) {
  if (!canShowTooltip(primitive, frame)) return ""

  const dataKey = primitive.props?.dataKey
  const points = createSeriesPoints(primitive, frame).filter((point) =>
    Number.isFinite(point.y),
  )

  return svg`
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
          r="8"
          fill="transparent"
          pointer-events="all"
          @mouseenter=${tooltip.onEnter}
          @mouseleave=${tooltip.onLeave}
        >
          ${tooltip.title}
        </circle>
      `
    })}
  `
}

/**
 * What hovering a datum does. With an entity, the tooltip is the entity's
 * state, shown and hidden by events and drawn by the tooltip overlay. Without
 * one there is no state to keep, so the browser's own tooltip shows a <title>
 * with `text`.
 *
 * @param {object} target - The hovered datum: its row `index`, and the
 *   `dataKey` of its series (none for a pie slice).
 * @param {{ label: string, value: string }} text
 */
export function getTooltipBindings(frame, primitive, target, text) {
  if (!canShowTooltip(primitive, frame)) return NO_TOOLTIP

  if (frame.entityId) {
    const { api, entityId } = frame
    return {
      onEnter: () => api.notify(`#${entityId}:tooltipShow`, target),
      onLeave: () => api.notify(`#${entityId}:tooltipHide`),
      title: "",
    }
  }

  return { title: renderTitle(text) }
}

const NO_TOOLTIP = { title: "" }

/** The label and value a tooltip shows for a row. */
export function getTooltipText(frame, row, dataKey) {
  const { entity } = frame
  const label = row?.[entity.xKey] ?? row?.label ?? row?.name ?? ""
  const value = dataKey ? row?.[dataKey] : row?.value
  return {
    label: String(label),
    value: value == null ? "" : formatTooltipValue(frame, value, dataKey),
  }
}

/**
 * A tooltip's value, through the `Tooltip` primitive's `formatter` or, in
 * config mode, the `tooltipFormatter` the chart's render passes.
 *
 * @param {object} frame
 * @param {unknown} value
 * @param {string | null} name - The series' data key, or the slice's name.
 * @returns {string}
 */
export function formatTooltipValue(frame, value, name) {
  const tooltip = frame.primitives?.find((item) => item.type === "tooltip")
  const formatter =
    tooltip?.props?.formatter || frame.entity.tooltipFormatter || String
  return String(formatter(value, name))
}

export function renderTitle({ label, value }) {
  // @lit-labs/ssr can't render a binding inside a raw-text <title>, so emit it as raw SVG.
  return svg`${unsafeSVG(`<title>${escapeXml(`${label}: ${value}`)}</title>`)}`
}

export function createSeriesPoints(primitive, frame) {
  const { entity, scales } = frame
  const dataKey = primitive.props?.dataKey
  const stackId = primitive.props?.stackId
  // Bars stack with bars; areas, and the dots placed on them, with areas.
  const stackKind = primitive.type === "bar" ? "bar" : "area"
  const stackedKeys = stackId
    ? frame.primitives
        .filter(
          (item) => item.type === stackKind && item.props?.stackId === stackId,
        )
        .map((item) => item.props?.dataKey)
    : []
  const currentStackIndex = stackedKeys.indexOf(dataKey)

  return entity.data.map((row, index) => {
    // A missing value is a gap: no point, while a stack below still counts it
    // as zero.
    const value = Number.isFinite(row?.[dataKey]) ? row[dataKey] : NaN
    const previousStackValue =
      currentStackIndex > 0
        ? stackedKeys
            .slice(0, currentStackIndex)
            .reduce(
              (total, key) =>
                total + (Number.isFinite(row?.[key]) ? row[key] : 0),
              0,
            )
        : 0
    const stackedValue = previousStackValue + value
    const yValue = stackId ? stackedValue : value

    return {
      row,
      index,
      x: getCategoryX(scales, index),
      y: scales.yScale(yValue),
      y0: stackId ? scales.yScale(previousStackValue) : scales.yScale(0),
    }
  })
}

export function resolveSeriesColor(frame, dataKey) {
  const plottedKeys = frame.scales.plottedKeys || frame.entity.seriesKeys
  const index = Math.max(0, plottedKeys.indexOf(dataKey))
  return frame.entity.colors[index % frame.entity.colors.length]
}

export function canShowTooltip(primitive, frame) {
  return Boolean(frame.entity?.isTooltipEnabled || primitive.props?.hasTooltip)
}

export function resolveLegendItems(primitive, frame) {
  const dataKeys =
    primitive.props?.dataKeys ||
    frame.scales.plottedKeys ||
    frame.entity.seriesKeys

  return dataKeys.map((dataKey, index) => ({
    label: dataKey,
    color:
      primitive.props?.colors?.[index] ||
      getSeriesPrimitiveColor(frame, dataKey) ||
      resolveSeriesColor(frame, dataKey),
  }))
}

// The color a series primitive was given, so the legend matches what is drawn.
export function getSeriesPrimitiveColor(frame, dataKey) {
  const series = frame.primitives.find(
    (item) =>
      ["line", "area", "bar", "scatter", "radar"].includes(item.type) &&
      item.props?.dataKey === dataKey,
  )
  if (!series) return null
  return series.type === "line"
    ? series.props.stroke
    : series.props.fill || series.props.stroke
}

export function getBarGroupWidth(frame) {
  const { scales, dimensions, entity } = frame

  if (scales.xScaleMode === "band") {
    return scales.xScale.bandwidth()
  }

  if (typeof scales.xScale.step === "function") {
    return Math.max(12, scales.xScale.step() * 0.6)
  }

  return Math.max(12, dimensions.plotWidth / Math.max(1, entity.data.length))
}

/** The center of a row's category on the x axis. */
export function getCategoryX(scales, index) {
  return bandCenter(scales.xScale(index), scales.xScale.bandwidth())
}

export function maximumValue(rows, dataKey) {
  return Math.max(
    ...rows.map((row) => (Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0)),
  )
}

export function minimumValue(rows, dataKey) {
  return Math.min(
    ...rows.map((row) => (Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0)),
  )
}

export function bandCenter(start, bandwidth) {
  return (start ?? 0) + bandwidth / 2
}

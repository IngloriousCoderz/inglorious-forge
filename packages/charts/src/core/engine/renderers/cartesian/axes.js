/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { format } from "d3-format"

import { AXIS_LABEL_ROOM, CHAR_WIDTH } from "../../../defaults.js"
import { themeColor } from "../../theme.js"
import { getCategoryX } from "./shared.js"

const AXIS_COLOR = themeColor("axis", "#cbd5e1")
const TICK_COLOR = themeColor("text-muted", "#64748b")
const formatNumber = format(",")

const TICK_FONT_SIZE = 12
const DEFAULT_MIN_TICK_GAP = 5
const VALUE_TICKS = 5

export function renderCartesianGrid(primitive, frame) {
  const { scales, dimensions } = frame
  // Lines across the categories go where their axis shows a label.
  const categoryLines = getAxisTicks(frame, findCategoryAxis(frame), true).map(
    ({ position }) => position,
  )
  const valueLines = scales.yScale
    .ticks(VALUE_TICKS)
    .map((tick) => scales.yScale(tick))
  const verticals = scales.isHorizontal ? valueLines : categoryLines
  const horizontals = scales.isHorizontal ? categoryLines : valueLines
  // A stroke given to the grid wins over the theme's.
  const stroke = primitive.props?.stroke || themeColor("grid", "#e5e7eb")
  const dasharray = primitive.props?.strokeDasharray || "5 5"

  return svg`
    <g class="iw-chart-grid">
      ${verticals.map(
        (x) => svg`
          <line
            x1=${x}
            y1=${dimensions.plotTop}
            x2=${x}
            y2=${dimensions.plotBottom}
            style="stroke: ${stroke}"
            stroke-dasharray=${dasharray}
          />
        `,
      )}
      ${horizontals.map(
        (y) => svg`
          <line
            x1=${dimensions.plotLeft}
            y1=${y}
            x2=${dimensions.plotRight}
            y2=${y}
            style="stroke: ${stroke}"
            stroke-dasharray=${dasharray}
          />
        `,
      )}
    </g>
  `
}

export function renderXAxis(primitive, frame) {
  const { dimensions } = frame

  return svg`
    <g class="iw-chart-axis iw-chart-axis-x">
      <line
        x1=${dimensions.plotLeft}
        y1=${dimensions.plotBottom}
        x2=${dimensions.plotRight}
        y2=${dimensions.plotBottom}
        style="stroke: ${AXIS_COLOR}"
      />
      ${getAxisTicks(frame, primitive, !frame.scales.isHorizontal).map(
        ({ position, label }) => {
          return svg`
          <text
            x=${position}
            y=${dimensions.plotBottom + 24}
            style="fill: ${TICK_COLOR}"
            font-size=${TICK_FONT_SIZE}
            text-anchor="middle"
          >
            ${label}
          </text>
        `
        },
      )}
      ${when(
        primitive.props?.label,
        () => svg`<text
              class="iw-chart-axis-label"
              x=${dimensions.plotLeft + dimensions.plotWidth / 2}
              y=${dimensions.plotBottom + 24 + AXIS_LABEL_ROOM}
              style="fill: ${TICK_COLOR}"
              font-size=${TICK_FONT_SIZE}
              text-anchor="middle"
            >
              ${primitive.props.label}
            </text>`,
      )}
    </g>
  `
}

export function renderYAxis(primitive, frame) {
  const { dimensions } = frame

  return svg`
    <g class="iw-chart-axis iw-chart-axis-y">
      <line
        x1=${dimensions.plotLeft}
        y1=${dimensions.plotTop}
        x2=${dimensions.plotLeft}
        y2=${dimensions.plotBottom}
        style="stroke: ${AXIS_COLOR}"
      />
      ${getAxisTicks(frame, primitive, frame.scales.isHorizontal).map(
        ({ position, label }) => svg`
          <text
            x=${dimensions.plotLeft - 12}
            y=${position + 4}
            style="fill: ${TICK_COLOR}"
            font-size=${TICK_FONT_SIZE}
            text-anchor="end"
          >
            ${label}
          </text>
        `,
      )}
      ${when(
        primitive.props?.label,
        () => svg`<text
              class="iw-chart-axis-label"
              transform="translate(${TICK_FONT_SIZE}, ${dimensions.plotTop + dimensions.plotHeight / 2}) rotate(-90)"
              style="fill: ${TICK_COLOR}"
              font-size=${TICK_FONT_SIZE}
              text-anchor="middle"
            >
              ${primitive.props.label}
            </text>`,
      )}
    </g>
  `
}

/**
 * The ticks an axis shows: the categories' on the category axis, the x axis
 * unless the bars are horizontal, and evenly spread values on the other.
 *
 * @param {object} frame
 * @param {object} axis - The axis primitive, for its props.
 * @param {boolean} isCategoryAxis
 * @returns {{ position: number, label: string }[]}
 */
function getAxisTicks(frame, axis, isCategoryAxis) {
  const { scales } = frame
  if (!isCategoryAxis) return getValueTicks(scales.yScale, axis)
  // A scatter chart's x axis is a number too.
  return scales.xScaleMode === "linear"
    ? getValueTicks(scales.xScale, axis)
    : getCategoryTicks(frame, axis)
}

function getValueTicks(scale, axis) {
  const formatTick = axis?.props?.tickFormatter || formatNumber
  return scale.ticks(VALUE_TICKS).map((tick) => ({
    position: scale(tick),
    label: String(formatTick(tick)),
  }))
}

/** The axis that names the categories: the y axis for horizontal bars. */
function findCategoryAxis(frame) {
  const type = frame.scales.isHorizontal ? "y-axis" : "x-axis"
  return frame.primitives.find((item) => item.type === type)
}

/**
 * The category ticks to show, as Recharts does: with a numeric `interval`,
 * every (interval + 1)th row from the first; by default, as many as fit
 * without their labels overlapping, keeping the last.
 *
 * @param {object} frame
 * @param {object} [axis] - The category axis primitive, for its props.
 * @returns {{ index: number, position: number, label: string }[]}
 */
export function getCategoryTicks(frame, axis) {
  const { entity, scales } = frame
  const props = axis?.props ?? {}
  const dataKey = props.dataKey || entity.xKey
  const formatTick = props.tickFormatter || String
  const ticks = entity.data.map((row, index) => ({
    index,
    position: getCategoryX(scales, index),
    label: String(formatTick(row?.[dataKey] ?? index)),
  }))

  if (Number.isFinite(props.interval)) {
    const stride = Math.max(0, Math.floor(props.interval)) + 1
    return ticks.filter(({ index }) => index % stride === 0)
  }

  // Stacked down the left, labels take a line's height; side by side along
  // the bottom, their estimated width.
  const sizeOf = scales.isHorizontal
    ? () => TICK_FONT_SIZE
    : (tick) => tick.label.length * CHAR_WIDTH
  return keepTicksThatFit(
    ticks,
    props.minTickGap ?? DEFAULT_MIN_TICK_GAP,
    sizeOf,
  )
}

// Walks back from the last tick, keeping each one whose label ends at least
// `minTickGap` before the label kept after it starts.
function keepTicksThatFit(ticks, minTickGap, sizeOf) {
  const kept = []
  let nextLabelStart = Infinity

  for (let i = ticks.length - 1; i >= 0; i--) {
    const tick = ticks[i]
    const halfSize = sizeOf(tick) / 2
    if (tick.position + halfSize + minTickGap <= nextLabelStart) {
      kept.unshift(tick)
      nextLabelStart = tick.position - halfSize
    }
  }

  return kept
}

/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { format } from "d3-format"

import { AXIS_LABEL_ROOM } from "../../../defaults.js"
import { themeColor } from "../../theme.js"
import { getCategoryX } from "./shared.js"

const AXIS_COLOR = themeColor("axis", "#cbd5e1")
const TICK_COLOR = themeColor("text-muted", "#64748b")
const formatNumber = format(",")

// SVG text cannot be measured before it is drawn, so a label's width is
// estimated from its length at the axis' font size.
const TICK_FONT_SIZE = 12
const CHAR_WIDTH = 7
const DEFAULT_MIN_TICK_GAP = 5

export function renderCartesianGrid(primitive, frame) {
  const { scales, dimensions } = frame
  // Vertical lines go where the x axis shows a label.
  const xAxis = frame.primitives.find((item) => item.type === "x-axis")
  // A stroke given to the grid wins over the theme's.
  const stroke = primitive.props?.stroke || themeColor("grid", "#e5e7eb")
  const dasharray = primitive.props?.strokeDasharray || "5 5"

  return svg`
    <g class="iw-chart-grid">
      ${getXTicks(frame, xAxis).map(({ x }) => {
        return svg`
          <line
            x1=${x}
            y1=${dimensions.plotTop}
            x2=${x}
            y2=${dimensions.plotBottom}
            style="stroke: ${stroke}"
            stroke-dasharray=${dasharray}
          />
        `
      })}
      ${scales.yScale.ticks(5).map((tick) => {
        const y = scales.yScale(tick)
        return svg`
          <line
            x1=${dimensions.plotLeft}
            y1=${y}
            x2=${dimensions.plotRight}
            y2=${y}
            style="stroke: ${stroke}"
            stroke-dasharray=${dasharray}
          />
        `
      })}
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
      ${getXTicks(frame, primitive).map(({ x, label }) => {
        return svg`
          <text
            x=${x}
            y=${dimensions.plotBottom + 24}
            style="fill: ${TICK_COLOR}"
            font-size=${TICK_FONT_SIZE}
            text-anchor="middle"
          >
            ${label}
          </text>
        `
      })}
      ${
        primitive.props?.label
          ? svg`<text
              class="iw-chart-axis-label"
              x=${dimensions.plotLeft + dimensions.plotWidth / 2}
              y=${dimensions.plotBottom + 24 + AXIS_LABEL_ROOM}
              style="fill: ${TICK_COLOR}"
              font-size=${TICK_FONT_SIZE}
              text-anchor="middle"
            >
              ${primitive.props.label}
            </text>`
          : ""
      }
    </g>
  `
}

export function renderYAxis(primitive, frame) {
  const { scales, dimensions } = frame
  const formatTick = primitive.props?.tickFormatter || formatNumber

  return svg`
    <g class="iw-chart-axis iw-chart-axis-y">
      <line
        x1=${dimensions.plotLeft}
        y1=${dimensions.plotTop}
        x2=${dimensions.plotLeft}
        y2=${dimensions.plotBottom}
        style="stroke: ${AXIS_COLOR}"
      />
      ${scales.yScale.ticks(5).map((tick) => {
        const y = scales.yScale(tick)
        return svg`
          <text
            x=${dimensions.plotLeft - 12}
            y=${y + 4}
            style="fill: ${TICK_COLOR}"
            font-size="12"
            text-anchor="end"
          >
            ${formatTick(tick)}
          </text>
        `
      })}
      ${
        primitive.props?.label
          ? svg`<text
              class="iw-chart-axis-label"
              transform="translate(${TICK_FONT_SIZE}, ${dimensions.plotTop + dimensions.plotHeight / 2}) rotate(-90)"
              style="fill: ${TICK_COLOR}"
              font-size=${TICK_FONT_SIZE}
              text-anchor="middle"
            >
              ${primitive.props.label}
            </text>`
          : ""
      }
    </g>
  `
}

/**
 * The x axis ticks to show, as Recharts does: with a numeric `interval`, every
 * (interval + 1)th row from the first; by default, as many as fit without their
 * labels overlapping, keeping the last.
 *
 * @param {object} frame
 * @param {object} [xAxis] - The x axis primitive, for its props.
 * @returns {{ index: number, x: number, label: string }[]}
 */
export function getXTicks(frame, xAxis) {
  const { entity, scales } = frame
  const props = xAxis?.props ?? {}
  const dataKey = props.dataKey || entity.xKey
  const formatTick = props.tickFormatter || String
  const ticks = entity.data.map((row, index) => ({
    index,
    x: getCategoryX(scales, index),
    label: String(formatTick(row?.[dataKey] ?? index)),
  }))

  if (Number.isFinite(props.interval)) {
    const stride = Math.max(0, Math.floor(props.interval)) + 1
    return ticks.filter(({ index }) => index % stride === 0)
  }

  return keepTicksThatFit(ticks, props.minTickGap ?? DEFAULT_MIN_TICK_GAP)
}

// Walks back from the last tick, keeping each one whose label ends at least
// `minTickGap` before the label kept after it starts.
function keepTicksThatFit(ticks, minTickGap) {
  const kept = []
  let nextLabelStart = Infinity

  for (let i = ticks.length - 1; i >= 0; i--) {
    const tick = ticks[i]
    const halfWidth = (tick.label.length * CHAR_WIDTH) / 2
    if (tick.x + halfWidth + minTickGap <= nextLabelStart) {
      kept.unshift(tick)
      nextLabelStart = tick.x - halfWidth
    }
  }

  return kept
}

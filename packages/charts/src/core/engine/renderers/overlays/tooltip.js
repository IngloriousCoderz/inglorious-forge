/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

import { themeColor } from "../../theme.js"
import { getCartesianTooltipAnchor } from "../cartesian/index.js"
import {
  getSeriesPrimitiveColor,
  getTooltipText,
  resolveSeriesColor,
} from "../cartesian/shared.js"
import { getPieTooltip } from "../polar/index.js"

const HEIGHT = 50
const GAP = 12
// SVG text cannot be measured before it is drawn, so the box is sized from an
// average character width.
const CHAR_WIDTH = 7
const MIN_WIDTH = 80

/**
 * Draws the tooltip of the hovered datum, kept in the entity's `tooltip` by the
 * `tooltipShow` and `tooltipHide` events. It sits beside the datum, flipped to
 * stay inside the chart.
 */
export function renderTooltip(frame) {
  const tooltip = frame.entityId ? resolveTooltip(frame) : null
  if (!tooltip) return ""

  const { anchor, color, text } = tooltip
  const { width: chartWidth, height: chartHeight } = frame.dimensions
  const width = Math.max(
    MIN_WIDTH,
    CHAR_WIDTH * Math.max(text.label.length, text.value.length) + 34,
  )
  const x =
    anchor.x + GAP + width <= chartWidth
      ? anchor.x + GAP
      : Math.max(0, anchor.x - GAP - width)
  const y = Math.min(
    Math.max(0, anchor.y - HEIGHT - GAP),
    Math.max(0, chartHeight - HEIGHT),
  )

  return svg`
    <g
      class="iw-chart-tooltip"
      transform="translate(${x}, ${y})"
      pointer-events="none"
    >
      <rect
        width=${width}
        height=${HEIGHT}
        rx="6"
        style="fill: ${themeColor("surface", "#ffffff")}; stroke: ${themeColor("border", "#cbd5e1")}"
        fill-opacity="0.95"
      />
      <circle cx="12" cy="16" r="4" fill=${color} />
      <text
        x="22"
        y="20"
        font-size="12"
        style="fill: ${themeColor("text-muted", "#475569")}"
      >
        ${text.label}
      </text>
      <text
        x="12"
        y="38"
        font-size="13"
        font-weight="600"
        style="fill: ${themeColor("text", "#0f172a")}"
      >
        ${text.value}
      </text>
    </g>
  `
}

function resolveTooltip(frame) {
  const state = frame.entity.tooltip
  if (!state || !Number.isInteger(state.index)) return null

  if (frame.primitives.some((item) => item.type === "pie")) {
    return getPieTooltip(frame, state)
  }

  const anchor = getCartesianTooltipAnchor(frame, state)
  if (!anchor) return null

  return {
    anchor,
    color:
      getSeriesPrimitiveColor(frame, state.dataKey) ||
      resolveSeriesColor(frame, state.dataKey),
    text: getTooltipText(frame, frame.entity.data[state.index], state.dataKey),
  }
}

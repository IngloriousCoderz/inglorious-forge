/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { max } from "d3-array"
import { arc } from "d3-shape"

import { themeColor } from "../../theme.js"
import {
  canShowTooltip,
  formatTooltipValue,
  getTooltipBindings,
} from "../cartesian/shared.js"

/**
 * How far round a full ring goes: three quarters, so the rings' names fit in
 * the quarter left open, at their start.
 */
const DEFAULT_SWEEP = 270
const RING_FILL = 0.75
const TRACK_OPACITY = 0.15
const LABEL_GAP = 6
const QUARTER_TURN = 90
const HALF_TURN = 180
const FULL_TURN = 360
const toRadians = (degrees) => (degrees * Math.PI) / HALF_TURN
const toDegrees = (radians) => (radians * HALF_TURN) / Math.PI
const LABEL_COLOR = themeColor("text", "#0f172a")

/**
 * A ring per row, innermost first, filled as far round as its value is of
 * the largest; a faint track shows how far a full one goes.
 */
export function renderRadialBars(primitive, frame) {
  const { centerX, centerY } = frame.scales
  const rings = getRings(primitive, frame)
  const hasLabel = primitive.props?.hasLabel

  return svg`
    <g class="iw-chart-radial" transform="translate(${centerX}, ${centerY})">
      ${rings.map((ring) => {
        const tooltip = getTooltipBindings(
          frame,
          primitive,
          { index: ring.index },
          getRadialTooltipText(frame, ring),
        )
        return svg`
          <g>
            <path d=${ring.track} fill=${ring.fill} fill-opacity=${TRACK_OPACITY} />
            <path
              d=${ring.bar}
              fill=${ring.fill}
              pointer-events="all"
              style=${canShowTooltip(primitive, frame) ? "cursor: pointer;" : undefined}
              @mouseenter=${tooltip.onEnter}
              @mouseleave=${tooltip.onLeave}
            >
              ${tooltip.title}
            </path>
            ${when(hasLabel, () => renderRingLabel(ring))}
          </g>
        `
      })}
    </g>
  `
}

function renderRingLabel({ radius, startAngle, label }) {
  const sin = Math.sin(startAngle)
  const cos = Math.cos(startAngle)
  const x = radius * sin - cos * LABEL_GAP
  const y = -radius * cos - sin * LABEL_GAP
  const degrees = normalizeDegrees(toDegrees(startAngle))
  const isUpright = Math.abs(degrees) <= QUARTER_TURN
  const rotation = isUpright ? degrees : degrees - HALF_TURN
  return svg`
    <text
      transform="translate(${x}, ${y}) rotate(${rotation})"
      style="fill: ${LABEL_COLOR}"
      font-size="12"
      text-anchor=${isUpright ? "end" : "start"}
      dominant-baseline="middle"
    >
      ${label}
    </text>
  `
}

/** Degrees between -180 and 180. */
function normalizeDegrees(degrees) {
  const turned = ((degrees % FULL_TURN) + FULL_TURN) % FULL_TURN
  return turned > HALF_TURN ? turned - FULL_TURN : turned
}

/** A legend item per ring: its name, in its color. */
export function getRadialLegendItems(frame) {
  const primitive = frame.primitives.find((item) => item.type === "radial-bar")
  if (!primitive) return []
  return getRings(primitive, frame).map(({ label, fill }) => ({
    label,
    color: fill,
  }))
}

/** The tooltip of a hovered ring, pointing at where its bar ends. */
export function getRadialTooltip(frame, { index }) {
  const primitive = frame.primitives.find((item) => item.type === "radial-bar")
  const ring = primitive && getRings(primitive, frame)[index]
  if (!ring) return null

  return {
    anchor: {
      x: frame.scales.centerX + ring.radius * Math.sin(ring.endAngle),
      y: frame.scales.centerY - ring.radius * Math.cos(ring.endAngle),
    },
    color: ring.fill,
    text: getRadialTooltipText(frame, ring),
  }
}

function getRings(primitive, frame) {
  const { entity, scales } = frame
  const dataKey = primitive.props?.dataKey || entity.dataKey
  const nameKey = primitive.props?.nameKey || entity.nameKey
  const rows = entity.data
  const largest = max(rows, (row) => row?.[dataKey]) || 1
  const startAngle = toRadians(primitive.props?.startAngle ?? 0)
  const endAngle = toRadians(
    primitive.props?.endAngle ??
      (primitive.props?.startAngle ?? 0) + DEFAULT_SWEEP,
  )
  const band =
    (scales.outerRadius - scales.innerRadius) / Math.max(1, rows.length)
  const thickness = band * RING_FILL

  return rows.map((row, index) => {
    const radius = scales.innerRadius + band * (index + 0.5)
    const shape = arc()
      .innerRadius(radius - thickness / 2)
      .outerRadius(radius + thickness / 2)
      .cornerRadius(thickness / 2)
    const value = Math.max(0, row?.[dataKey] ?? 0)
    const end = startAngle + (endAngle - startAngle) * (value / largest)
    return {
      index,
      row,
      radius,
      startAngle,
      endAngle: end,
      label: row?.[nameKey] ?? row?.label,
      value,
      fill: row?.color || entity.colors[index % entity.colors.length],
      track: shape({ startAngle, endAngle }) || "",
      bar: shape({ startAngle, endAngle: end }) || "",
    }
  })
}

function getRadialTooltipText(frame, { label, value }) {
  const name = String(label ?? "")
  return { label: name, value: formatTooltipValue(frame, value, name) }
}

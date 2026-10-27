/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

import { themeColor } from "../../theme.js"
import {
  canShowTooltip,
  getSeriesPrimitiveColor,
  getTooltipBindings,
  getTooltipText,
  resolveSeriesColor,
} from "../cartesian/shared.js"

const GRID_RINGS = 4
const LABEL_GAP = 12
const FILL_OPACITY = 0.25
const DOT_RADIUS = 4
const TICK_COLOR = themeColor("text-muted", "#64748b")

/** The rings at the values the chart marks, and a spoke per category. */
export function renderPolarGrid(primitive, frame) {
  const { centerX, centerY, radiusScale } = frame.scales
  const count = frame.entity.data.length
  const stroke = primitive.props?.stroke || themeColor("grid", "#e5e7eb")
  const outer = radiusScale.range()[1]

  return svg`
    <g class="iw-chart-polar-grid" transform="translate(${centerX}, ${centerY})">
      ${radiusScale
        .ticks(GRID_RINGS)
        .filter((tick) => tick > 0)
        .map(
          (tick) => svg`
            <polygon
              points=${polygonPoints(count, () => radiusScale(tick))}
              fill="none"
              style="stroke: ${stroke}"
            />
          `,
        )}
      ${frame.entity.data.map((_, index) => {
        const [x, y] = toPoint(angleOf(index, count), outer)
        return svg`<line x1="0" y1="0" x2=${x} y2=${y} style="stroke: ${stroke}" />`
      })}
    </g>
  `
}

/** The categories' names, each at the end of its spoke. */
export function renderPolarAngleAxis(primitive, frame) {
  const { centerX, centerY, radiusScale } = frame.scales
  const { data, xKey } = frame.entity
  const formatTick = primitive.props?.tickFormatter || String
  const radius = radiusScale.range()[1] + LABEL_GAP

  return svg`
    <g class="iw-chart-polar-angle-axis" transform="translate(${centerX}, ${centerY})">
      ${data.map((row, index) => {
        const [x, y] = toPoint(angleOf(index, data.length), radius)
        const anchor = Math.abs(x) < 1 ? "middle" : x > 0 ? "start" : "end"
        return svg`
          <text
            x=${x}
            y=${y + 4}
            style="fill: ${TICK_COLOR}"
            font-size="12"
            text-anchor=${anchor}
          >
            ${formatTick(row?.[xKey] ?? index)}
          </text>
        `
      })}
    </g>
  `
}

/** One series: a filled shape through its value on every spoke. */
export function renderRadarSeries(primitive, frame) {
  const { centerX, centerY } = frame.scales
  const dataKey = primitive.props?.dataKey
  const color =
    primitive.props?.fill ||
    primitive.props?.stroke ||
    resolveSeriesColor(frame, dataKey)
  const vertices = getVertices(frame, dataKey)

  return svg`
    <g class="iw-chart-radar" transform="translate(${centerX}, ${centerY})">
      <polygon
        points=${vertices.map(([x, y]) => `${x},${y}`).join(" ")}
        fill=${color}
        fill-opacity=${primitive.props?.fillOpacity ?? FILL_OPACITY}
        stroke=${primitive.props?.stroke || color}
        stroke-width="2"
      />
      ${vertices.map(([x, y], index) => {
        const tooltip = getTooltipBindings(
          frame,
          primitive,
          { index, dataKey },
          getTooltipText(frame, frame.entity.data[index], dataKey),
        )
        return svg`
          <circle
            cx=${x}
            cy=${y}
            r=${DOT_RADIUS}
            fill=${color}
            pointer-events="all"
            style=${canShowTooltip(primitive, frame) ? "cursor: pointer;" : undefined}
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

/** The tooltip of a hovered vertex: its category and the series' value. */
export function getRadarTooltip(frame, { index, dataKey }) {
  const row = frame.entity.data[index]
  if (!row) return null

  const [x, y] = getVertices(frame, dataKey)[index]
  return {
    anchor: { x: frame.scales.centerX + x, y: frame.scales.centerY + y },
    color:
      getSeriesPrimitiveColor(frame, dataKey) ||
      resolveSeriesColor(frame, dataKey),
    text: getTooltipText(frame, row, dataKey),
  }
}

function getVertices(frame, dataKey) {
  const { data } = frame.entity
  const { radiusScale } = frame.scales
  return data.map((row, index) =>
    toPoint(
      angleOf(index, data.length),
      radiusScale(Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0),
    ),
  )
}

function polygonPoints(count, radiusOf) {
  return Array.from({ length: count }, (_, index) =>
    toPoint(angleOf(index, count), radiusOf(index)).join(","),
  ).join(" ")
}

// Categories go clockwise from twelve o'clock.
function angleOf(index, count) {
  return (index / Math.max(1, count)) * 2 * Math.PI
}

function toPoint(angle, radius) {
  return [radius * Math.sin(angle), -radius * Math.cos(angle)]
}

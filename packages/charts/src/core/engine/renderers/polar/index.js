/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { arc, pie as createPieLayout } from "d3-shape"

import { themeColor } from "../../theme.js"
import {
  canShowTooltip,
  formatTooltipValue,
  getTooltipBindings,
} from "../cartesian/shared.js"

const FULL_CIRCLE_START = 0
const FULL_CIRCLE = 360
const toRadians = (degrees) => (degrees * Math.PI) / 180

const LABEL_COLOR = themeColor("text", "#0f172a")
const SECONDARY_COLOR = themeColor("text-muted", "#64748b")
const CONNECTOR_COLOR = themeColor("axis", "#94a3b8")

export function renderPieSeries(primitive, frame) {
  const { scales } = frame
  const { slices, dataKey, nameKey } = createPieSlices(primitive, frame)
  const hasLabel = primitive.props?.hasLabel
  const labelPosition = primitive.props?.labelPosition || "outside"
  const hasPercentage = primitive.props?.hasPercentage !== false
  const createArc = arc()
    .innerRadius(scales.innerRadius)
    .outerRadius(scales.outerRadius)
  const innerLabelArc = createLabelArc(
    (scales.innerRadius + scales.outerRadius) / 2,
  )
  const connectorArc = createLabelArc(scales.outerRadius)
  const outerLabelArc = createLabelArc(scales.outerRadius + 18)

  return svg`
    <g
      class="iw-chart-pie"
      transform="translate(${scales.centerX}, ${scales.centerY})"
    >
      ${slices.map((slice) => {
        const { index, fill, label, percentage } = slice
        const tooltip = getTooltipBindings(
          frame,
          primitive,
          { index },
          getPieTooltipText(frame, slice, nameKey, dataKey),
        )
        const [insideLabelX, insideLabelY] = innerLabelArc.centroid(slice.arc)
        const [connectorStartX, connectorStartY] = connectorArc.centroid(
          slice.arc,
        )
        const [connectorEndX, connectorEndY] = outerLabelArc.centroid(slice.arc)
        const outsideLabelX = connectorEndX + (connectorEndX >= 0 ? 14 : -14)
        const textAnchor = connectorEndX >= 0 ? "start" : "end"

        return svg`
          <g>
            <path
              d=${createArc(slice.arc) || ""}
              fill=${fill}
              pointer-events="all"
              style=${
                canShowTooltip(primitive, frame)
                  ? "cursor: pointer;"
                  : undefined
              }
              @mouseenter=${tooltip.onEnter}
              @mouseleave=${tooltip.onLeave}
            >
              ${tooltip.title}
            </path>
            ${when(hasLabel, () =>
              when(
                labelPosition === "inside",
                () => svg`
                      <text
                        x=${insideLabelX}
                        y=${insideLabelY}
                        style="fill: ${LABEL_COLOR}"
                        font-size="12"
                        text-anchor="middle"
                        dominant-baseline="middle"
                      >
                        ${hasPercentage ? `${label} ${percentage}` : label}
                      </text>
                    `,
                () => svg`
                      <polyline
                        points=${`${connectorStartX},${connectorStartY} ${connectorEndX},${connectorEndY} ${outsideLabelX},${connectorEndY}`}
                        fill="none"
                        style="stroke: ${CONNECTOR_COLOR}"
                        stroke-width="1.5"
                      />
                      <text
                        x=${outsideLabelX}
                        y=${connectorEndY}
                        style="fill: ${LABEL_COLOR}"
                        font-size="12"
                        text-anchor=${textAnchor}
                      >
                        ${label}
                      </text>
                      ${when(
                        hasPercentage,
                        () => svg`
                              <text
                                x=${outsideLabelX}
                                y=${connectorEndY + 14}
                                style="fill: ${SECONDARY_COLOR}"
                                font-size="12"
                                text-anchor=${textAnchor}
                              >
                                ${percentage}
                              </text>
                            `,
                      )}
                    `,
              ),
            )}
          </g>
        `
      })}
    </g>
  `
}

export function renderCenterText(frame) {
  return svg`
    <text
      x=${frame.scales.centerX}
      y=${frame.scales.centerY}
      text-anchor="middle"
      dominant-baseline="middle"
      style="fill: ${LABEL_COLOR}"
      font-size="18"
      font-weight="600"
    >
      ${frame.entity.centerText}
    </text>
  `
}

/** A legend item per slice: its name, in its color. */
export function getPieLegendItems(frame) {
  const primitive = frame.primitives.find((item) => item.type === "pie")
  if (!primitive) return []

  return createPieSlices(primitive, frame).slices.map(({ label, fill }) => ({
    label,
    color: fill,
  }))
}

/**
 * The tooltip for a hovered slice: where it points (the middle of the slice's
 * edge) and what it says. Null when the slice is not drawn.
 */
export function getPieTooltip(frame, { index }) {
  const primitive = frame.primitives.find((item) => item.type === "pie")
  if (!primitive) return null

  const { slices, dataKey, nameKey } = createPieSlices(primitive, frame)
  const slice = slices[index]
  if (!slice) return null

  const [x, y] = createLabelArc(frame.scales.outerRadius).centroid(slice.arc)
  return {
    anchor: { x: frame.scales.centerX + x, y: frame.scales.centerY + y },
    color: slice.fill,
    text: getPieTooltipText(frame, slice, nameKey, dataKey),
  }
}

function createPieSlices(primitive, frame) {
  const { entity } = frame
  const dataKey = primitive.props?.dataKey || entity.dataKey
  const nameKey = primitive.props?.nameKey || entity.nameKey
  // Degrees clockwise from twelve o'clock: -90 to 90 draws the top half.
  const startAngle = primitive.props?.startAngle ?? FULL_CIRCLE_START
  const endAngle = primitive.props?.endAngle ?? startAngle + FULL_CIRCLE
  const arcs = createPieLayout()
    .sort(null)
    .startAngle(toRadians(startAngle))
    .endAngle(toRadians(endAngle))
    .value((row) => (Number.isFinite(row?.[dataKey]) ? row[dataKey] : 0))(
    entity.data,
  )
  const total = arcs.reduce((sum, slice) => sum + slice.value, 0)

  const slices = arcs.map((sliceArc, index) => {
    const row = entity.data[index]
    return {
      arc: sliceArc,
      index,
      row,
      fill: row?.color || entity.colors[index % entity.colors.length],
      label: row?.[nameKey] ?? row?.label,
      percentage: total
        ? `${Math.round((sliceArc.value / total) * 100)}%`
        : "0%",
    }
  })

  return { slices, dataKey, nameKey }
}

function getPieTooltipText(frame, { row, percentage }, nameKey, dataKey) {
  const name = String(row?.[nameKey] ?? row?.label ?? "")
  const value = row?.[dataKey]
  return {
    label: name,
    value:
      value == null
        ? percentage
        : `${formatTooltipValue(frame, value, name)} (${percentage})`,
  }
}

function createLabelArc(radius) {
  return arc().innerRadius(radius).outerRadius(radius)
}

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

/** The height of an outside label, one line or two with its share. */
const LABEL_LINE = 14
const LABEL_GAP = 2
const LABEL_OFFSET = 14
/** How far above its baseline a 12px label's middle is. */
const LABEL_BASELINE = 4
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
  const outsideLabels = layOutLabels(slices, scales, hasPercentage)

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
        const { startX, startY, elbowX, elbowY, labelX, labelY, anchor } =
          outsideLabels[index]
        // The line stops short of its label's text.
        const lineEndX = labelX + (anchor === "start" ? -LABEL_GAP : LABEL_GAP)

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
                        points=${`${startX},${startY} ${elbowX},${elbowY} ${lineEndX},${labelY - LABEL_BASELINE}`}
                        fill="none"
                        style="stroke: ${CONNECTOR_COLOR}"
                        stroke-width="1.5"
                      />
                      <text
                        x=${labelX}
                        y=${labelY}
                        style="fill: ${LABEL_COLOR}"
                        font-size="12"
                        text-anchor=${anchor}
                      >
                        ${label}
                      </text>
                      ${when(
                        hasPercentage,
                        () => svg`
                              <text
                                x=${labelX}
                                y=${labelY + LABEL_LINE}
                                style="fill: ${SECONDARY_COLOR}"
                                font-size="12"
                                text-anchor=${anchor}
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

/**
 * Where each slice's outside label goes: in a column on the slice's side of
 * the pie, level with the slice. Labels of small slices next to each other
 * would overlap, so on each side they are spread down, then back up if they
 * ran past the bottom, until each has its own line; each connector runs from
 * its slice, out past the pie, to its label.
 */
function layOutLabels(slices, scales, hasPercentage) {
  const connectorArc = createLabelArc(scales.outerRadius)
  const elbowArc = createLabelArc(scales.outerRadius + 18)
  const height = (hasPercentage ? 2 * LABEL_LINE : LABEL_LINE) + LABEL_GAP
  const lowest = scales.outerRadius + height
  const column = scales.outerRadius + 18 + LABEL_OFFSET

  const labels = slices.map((slice) => {
    const [startX, startY] = connectorArc.centroid(slice.arc)
    const [elbowX, elbowY] = elbowArc.centroid(slice.arc)
    const isRight = elbowX >= 0
    return {
      index: slice.index,
      startX,
      startY,
      elbowX,
      elbowY,
      labelX: isRight ? column : -column,
      labelY: elbowY,
      anchor: isRight ? "start" : "end",
      isRight,
    }
  })

  for (const isRight of [true, false]) {
    const side = labels
      .filter((label) => label.isRight === isRight)
      .sort((a, b) => a.labelY - b.labelY)
    side.forEach((label, i) => {
      if (i) label.labelY = Math.max(label.labelY, side[i - 1].labelY + height)
    })
    for (let i = side.length - 1; i >= 0; i--) {
      const limit = i === side.length - 1 ? lowest : side[i + 1].labelY - height
      side[i].labelY = Math.min(side[i].labelY, limit)
    }
  }

  return Object.fromEntries(labels.map((label) => [label.index, label]))
}

function createLabelArc(radius) {
  return arc().innerRadius(radius).outerRadius(radius)
}

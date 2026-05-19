/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { area as createAreaPath, line as createLinePath } from "d3-shape"

import { hideTooltip, showTooltip } from "../overlays/tooltip.js"
import {
  canShowTooltip,
  createSeriesPoints,
  getBarGroupWidth,
  getCategoryX,
  renderSeriesTitles,
  resolveSeriesColor,
  resolveTooltipTitle,
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
          ? renderSeriesTitles(primitive, frame)
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
          ? renderSeriesTitles(primitive, frame)
          : ""
      }
    </g>
  `
}

export function renderBarSeries(primitive, frame) {
  const { entity, scales } = frame
  const barPrimitives = frame.primitives.filter((item) => item.type === "bar")
  const barIndex = barPrimitives.indexOf(primitive)
  const groupWidth = getBarGroupWidth(frame)
  const barWidth = Math.max(6, groupWidth / Math.max(1, barPrimitives.length))
  const groupStart = -groupWidth / 2 + barWidth * barIndex

  return svg`
    <g class="iw-chart-bar">
      ${entity.data.map((row, index) => {
        const label = `${row?.[entity.xKey] ?? index}`
        const value = Number.isFinite(row?.[primitive.props?.dataKey])
          ? row[primitive.props.dataKey]
          : 0
        const x = getCategoryX(scales, label) + groupStart
        const y = value >= 0 ? scales.yScale(value) : scales.yScale(0)
        const baseY = value >= 0 ? scales.yScale(0) : scales.yScale(value)
        const height = Math.abs(baseY - y)
        const fill =
          primitive.props?.fill ||
          resolveSeriesColor(frame, primitive.props?.dataKey)

        return svg`
          <rect
            x=${x}
            y=${Math.min(y, baseY)}
            width=${barWidth}
            height=${height}
            fill=${fill}
            pointer-events="all"
            style=${
              canShowTooltip(primitive, frame) ? "cursor: pointer;" : undefined
            }
            @mouseenter=${(event) =>
              updateTooltip(
                event,
                row,
                frame,
                primitive.props?.dataKey,
                fill,
                primitive,
              )}
            @mousemove=${(event) =>
              updateTooltip(
                event,
                row,
                frame,
                primitive.props?.dataKey,
                fill,
                primitive,
              )}
            @mouseleave=${(event) => clearTooltip(event)}
          />
        `
      })}
    </g>
  `
}

export function renderDots(primitive, frame) {
  const series = createSeriesPoints(primitive, frame)
  const fill =
    primitive.props?.fill ||
    primitive.props?.stroke ||
    resolveSeriesColor(frame, primitive.props?.dataKey)
  const radius = primitive.props?.r || 4
  const dataKey = primitive.props?.dataKey

  return svg`
    <g class="iw-chart-dots">
      ${series.map(
        (point) => svg`
          <circle
            cx=${point.x}
            cy=${point.y}
            r=${radius}
            fill=${fill}
            pointer-events="all"
            style="cursor: pointer;"
            @mouseenter=${(event) =>
              updateTooltip(event, point.row, frame, dataKey, fill, primitive)}
            @mousemove=${(event) =>
              updateTooltip(event, point.row, frame, dataKey, fill, primitive)}
            @mouseleave=${(event) => clearTooltip(event)}
          >
            ${
              !canShowTooltip(primitive, frame)
                ? resolveTooltipTitle(
                    frame.entity,
                    primitive,
                    point.row,
                    dataKey,
                  )
                : ""
            }
          </circle>
        `,
      )}
    </g>
  `
}

function updateTooltip(event, row, frame, dataKey, fill, primitive) {
  if (!canShowTooltip(primitive, frame) || !row) return

  const svgEl = event.currentTarget?.closest?.("svg") || event.target
  const svgRect = svgEl?.getBoundingClientRect?.()
  if (!svgRect) return

  const relativeX = event.clientX - svgRect.left
  const relativeY = event.clientY - svgRect.top
  const offset = 15
  const x = Math.max(
    0,
    Math.min((frame.dimensions?.width ?? 0) - 140, relativeX + offset),
  )
  const y = Math.max(
    0,
    Math.min((frame.dimensions?.height ?? 0) - 60, relativeY - offset),
  )

  const label = row?.[frame.entity.xKey] ?? row?.label ?? row?.name ?? ""
  const value = dataKey ? row?.[dataKey] : row?.value

  showTooltip(svgEl, x, y, label, value, fill)
}

function clearTooltip(event) {
  hideTooltip(event?.currentTarget?.closest?.("svg"))
}

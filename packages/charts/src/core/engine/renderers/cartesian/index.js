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

export function renderLineSeries(component, frame) {
  const dataKey = component.props?.dataKey
  const stroke = component.props?.stroke || resolveSeriesColor(frame, dataKey)
  const series = createSeriesPoints(component, frame)
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
        stroke-width=${component.props?.strokeWidth || 3}
      />
      ${component.props?.showDots ? renderDots(component, frame) : ""}
      ${
        canShowTooltip(component, frame) && !component.props?.showDots
          ? renderSeriesTitles(component, frame)
          : ""
      }
    </g>
  `
}

export function renderAreaSeries(component, frame) {
  const dataKey = component.props?.dataKey
  const fill = component.props?.fill || resolveSeriesColor(frame, dataKey)
  const stroke = component.props?.stroke || fill
  const fillOpacity = component.props?.fillOpacity ?? 0.3
  const series = createSeriesPoints(component, frame)
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
        stroke-width=${component.props?.strokeWidth || 3}
      />
      ${component.props?.showDots ? renderDots(component, frame) : ""}
      ${
        canShowTooltip(component, frame) && !component.props?.showDots
          ? renderSeriesTitles(component, frame)
          : ""
      }
    </g>
  `
}

export function renderBarSeries(component, frame) {
  const { entity, scales } = frame
  const barComponents = frame.components.filter((item) => item.type === "bar")
  const barIndex = barComponents.indexOf(component)
  const groupWidth = getBarGroupWidth(frame)
  const barWidth = Math.max(6, groupWidth / Math.max(1, barComponents.length))
  const groupStart = -groupWidth / 2 + barWidth * barIndex

  return svg`
    <g class="iw-chart-bar">
      ${entity.data.map((row, index) => {
        const label = `${row?.[entity.xKey] ?? index}`
        const value = Number.isFinite(row?.[component.props?.dataKey])
          ? row[component.props.dataKey]
          : 0
        const x = getCategoryX(scales, label) + groupStart
        const y = value >= 0 ? scales.yScale(value) : scales.yScale(0)
        const baseY = value >= 0 ? scales.yScale(0) : scales.yScale(value)
        const height = Math.abs(baseY - y)
        const fill =
          component.props?.fill ||
          resolveSeriesColor(frame, component.props?.dataKey)

        return svg`
          <rect
            x=${x}
            y=${Math.min(y, baseY)}
            width=${barWidth}
            height=${height}
            fill=${fill}
            pointer-events="all"
            style=${
              canShowTooltip(component, frame) ? "cursor: pointer;" : undefined
            }
            @mouseenter=${(event) =>
              updateTooltip(
                event,
                row,
                frame,
                component.props?.dataKey,
                fill,
                component,
              )}
            @mousemove=${(event) =>
              updateTooltip(
                event,
                row,
                frame,
                component.props?.dataKey,
                fill,
                component,
              )}
            @mouseleave=${(event) => clearTooltip(event)}
          />
        `
      })}
    </g>
  `
}

export function renderDots(component, frame) {
  const series = createSeriesPoints(component, frame)
  const fill =
    component.props?.fill ||
    component.props?.stroke ||
    resolveSeriesColor(frame, component.props?.dataKey)
  const radius = component.props?.r || 4
  const dataKey = component.props?.dataKey

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
              updateTooltip(event, point.row, frame, dataKey, fill, component)}
            @mousemove=${(event) =>
              updateTooltip(event, point.row, frame, dataKey, fill, component)}
            @mouseleave=${(event) => clearTooltip(event)}
          >
            ${
              !canShowTooltip(component, frame)
                ? resolveTooltipTitle(
                    frame.entity,
                    component,
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

function updateTooltip(event, row, frame, dataKey, fill, component) {
  if (!canShowTooltip(component, frame) || !row) return

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

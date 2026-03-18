/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { area as createAreaPath, line as createLinePath } from "d3-shape"

import { COMPONENT_TYPES, DEFAULT_DOT_RADIUS } from "../../constants.js"
import {
  createSeriesPoints,
  getBarGroupWidth,
  getCategoryX,
  renderSeriesTitles,
  resolveSeriesColor,
  resolveTooltipTitle,
} from "./shared.js"

export function renderLineSeries(component, frame) {
  const { entity } = frame
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
        entity.tooltipEnabled && !component.props?.showDots
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
        frame.entity.tooltipEnabled && !component.props?.showDots
          ? renderSeriesTitles(component, frame)
          : ""
      }
    </g>
  `
}

export function renderBarSeries(component, frame) {
  const { entity, scales } = frame
  const barComponents = frame.components.filter(
    (item) => item.type === COMPONENT_TYPES.BAR,
  )
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
          >
            ${resolveTooltipTitle(
              frame.entity,
              component,
              row,
              component.props?.dataKey,
            )}
          </rect>
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
  const radius = component.props?.r || DEFAULT_DOT_RADIUS

  return svg`
    <g class="iw-chart-dots">
      ${series.map(
        (point) => svg`
          <circle cx=${point.x} cy=${point.y} r=${radius} fill=${fill}>
            ${resolveTooltipTitle(
              frame.entity,
              component,
              point.row,
              component.props?.dataKey,
            )}
          </circle>
        `,
      )}
    </g>
  `
}

/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"
import { format } from "d3-format"

import { DEFAULT_TICK_COUNT } from "../../../constants.js"
import { getCategoryX } from "./shared.js"

const formatTick = format(",")

export function renderCartesianGrid(component, frame) {
  const { scales, dimensions } = frame
  const stroke = component.props?.stroke || "#e5e7eb"
  const dasharray = component.props?.strokeDasharray || "5 5"

  return svg`
    <g class="iw-chart-grid">
      ${scales.xScale.domain().map((label) => {
        const x = getCategoryX(scales, label)
        return svg`
          <line
            x1=${x}
            y1=${dimensions.plotTop}
            x2=${x}
            y2=${dimensions.plotBottom}
            stroke=${stroke}
            stroke-dasharray=${dasharray}
          />
        `
      })}
      ${scales.yScale.ticks(DEFAULT_TICK_COUNT).map((tick) => {
        const y = scales.yScale(tick)
        return svg`
          <line
            x1=${dimensions.plotLeft}
            y1=${y}
            x2=${dimensions.plotRight}
            y2=${y}
            stroke=${stroke}
            stroke-dasharray=${dasharray}
          />
        `
      })}
    </g>
  `
}

export function renderXAxis(component, frame) {
  const { entity, scales, dimensions } = frame
  const dataKey = component.props?.dataKey || entity.xKey
  const labels = entity.data.map((row, index) => row?.[dataKey] ?? `${index}`)

  return svg`
    <g class="iw-chart-axis iw-chart-axis-x">
      <line
        x1=${dimensions.plotLeft}
        y1=${dimensions.plotBottom}
        x2=${dimensions.plotRight}
        y2=${dimensions.plotBottom}
        stroke="#cbd5e1"
      />
      ${labels.map((label, index) => {
        const domainValue = scales.xScale.domain()[index]
        const x = getCategoryX(scales, domainValue)
        return svg`
          <text
            x=${x}
            y=${dimensions.plotBottom + 24}
            fill="#64748b"
            font-size="12"
            text-anchor="middle"
          >
            ${label}
          </text>
        `
      })}
    </g>
  `
}

export function renderYAxis(component, frame) {
  const { scales, dimensions } = frame
  void component

  return svg`
    <g class="iw-chart-axis iw-chart-axis-y">
      <line
        x1=${dimensions.plotLeft}
        y1=${dimensions.plotTop}
        x2=${dimensions.plotLeft}
        y2=${dimensions.plotBottom}
        stroke="#cbd5e1"
      />
      ${scales.yScale.ticks(DEFAULT_TICK_COUNT).map((tick) => {
        const y = scales.yScale(tick)
        return svg`
          <text
            x=${dimensions.plotLeft - 12}
            y=${y + 4}
            fill="#64748b"
            font-size="12"
            text-anchor="end"
          >
            ${formatTick(tick)}
          </text>
        `
      })}
    </g>
  `
}

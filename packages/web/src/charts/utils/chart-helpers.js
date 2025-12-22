/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { formatDate, formatNumber } from "./format.js"

/* Accessors */

export function getSeriesValues(series) {
  return Array.isArray(series.values) ? series.values : [series]
}

/* Axis Lines */

export function renderAxisLines(entity) {
  const { padding, width, height } = entity

  return svg`
    <!-- Eixo X -->
    <line
      x1=${padding.left}
      y1=${height - padding.bottom}
      x2=${width - padding.right}
      y2=${height - padding.bottom}
      stroke="#ddd"
      stroke-width="1"
    />
    <!-- Eixo Y -->
    <line
      x1=${padding.left}
      y1=${padding.top}
      x2=${padding.left}
      y2=${height - padding.bottom}
      stroke="#ddd"
      stroke-width="1"
    />
  `
}

/* Axis Labels */

// Render X axis labels (with ticks)
export function renderXAxis(entity, xScale) {
  const ticks = xScale.ticks ? xScale.ticks(5) : xScale.domain()
  const { height, padding } = entity

  return svg`
    ${repeat(
      ticks,
      (t) => t,
      (t) => {
        const x = xScale(t)
        const label =
          entity.xAxisType === "time" ? formatDate(t) : formatNumber(t)

        return svg`
        <g>
          <line
            x1=${x}
            y1=${height - padding.bottom}
            x2=${x}
            y2=${height - padding.bottom + 5}
            stroke="#ccc"
            stroke-width="1"
          />
          <text
            x=${x}
            y=${height - padding.bottom + 20}
            text-anchor="middle"
            font-size="11"
            fill="#777"
          >${label}</text>
        </g>
      `
      },
    )}
  `
}

// Render Y axis labels (with ticks)
export function renderYAxis(entity, yScale) {
  const ticks = yScale.ticks(5)
  const { padding } = entity

  return svg`
    ${repeat(
      ticks,
      (t) => t,
      (t) => {
        const y = yScale(t)
        return svg`
        <g>
          <line
            x1=${padding.left}
            y1=${y}
            x2=${padding.left - 5}
            y2=${y}
            stroke="#ccc"
            stroke-width="1"
          />
          <text
            x=${padding.left - 10}
            y=${y + 4}
            text-anchor="end"
            font-size="11"
            fill="#777"
          >${formatNumber(t)}</text>
        </g>
      `
      },
    )}
  `
}

/* Grid */

// Render full grid (X and Y) - used by line charts
export function renderGrid(entity, xScale, yScale) {
  const { padding, width, height } = entity
  const xTicks = xScale.ticks ? xScale.ticks(5) : []
  const yTicks = yScale.ticks ? yScale.ticks(5) : []

  return svg`
    ${repeat(
      xTicks,
      (tick) => tick,
      (tick) => svg`
        <line
          x1=${xScale(tick)}
          y1=${padding.top}
          x2=${xScale(tick)}
          y2=${height - padding.bottom}
          stroke="#f0f0f0"
          stroke-dasharray="2,2"
        />
      `,
    )}
    ${repeat(
      yTicks,
      (tick) => tick,
      (tick) => svg`
        <line
          x1=${padding.left}
          y1=${yScale(tick)}
          x2=${width - padding.right}
          y2=${yScale(tick)}
          stroke="#f0f0f0"
          stroke-dasharray="2,2"
        />
      `,
    )}
  `
}

// Render grid only Y - used by bar charts
export function renderYGrid(entity, yScale) {
  const { padding, width } = entity
  const yTicks = yScale.ticks ? yScale.ticks(5) : []

  return svg`
    ${repeat(
      yTicks,
      (tick) => tick,
      (tick) => svg`
        <line
          x1=${padding.left}
          y1=${yScale(tick)}
          x2=${width - padding.right}
          y2=${yScale(tick)}
          stroke="#f0f0f0"
          stroke-dasharray="2,2"
        />
      `,
    )}
  `
}

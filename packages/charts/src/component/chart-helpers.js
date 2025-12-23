/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { formatDate, formatNumber } from "../utils/format.js"

/* Accessors */

export function getSeriesValues(series) {
  return Array.isArray(series.values) ? series.values : [series]
}

/* Axis Lines */

export function renderAxisLines(entity, yScale = null) {
  const { padding, width, height } = entity

  // If yScale is provided and the domain includes negative values,
  // position the X axis at the zero of the Y axis
  let xAxisY = height - padding.bottom
  if (yScale) {
    const domain = yScale.domain()
    const minDomain = domain[0]
    if (minDomain < 0) {
      // If there are negative values, position the X axis at the zero of the Y axis
      xAxisY = yScale(0)
    }
  }

  return svg`
    <!-- Eixo X -->
    <line
      x1=${padding.left}
      y1=${xAxisY}
      x2=${width - padding.right}
      y2=${xAxisY}
      stroke="#ddd"
      stroke-width="0.0625em"
    />
    <!-- Eixo Y -->
    <line
      x1=${padding.left}
      y1=${padding.top}
      x2=${padding.left}
      y2=${height - padding.bottom}
      stroke="#ddd"
      stroke-width="0.0625em"
    />
  `
}

/* Axis Labels */

// Render X axis labels (with ticks)
export function renderXAxis(entity, xScale, yScale = null) {
  const ticks = xScale.ticks ? xScale.ticks(5) : xScale.domain()
  const { height, padding } = entity

  // If yScale is provided and the domain includes negative values,
  // position the ticks and labels at the zero of the Y axis
  let xAxisY = height - padding.bottom
  if (yScale) {
    const domain = yScale.domain()
    const minDomain = domain[0]
    if (minDomain < 0) {
      xAxisY = yScale(0)
    }
  }

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
            y1=${xAxisY}
            x2=${x}
            y2=${xAxisY + 5}
            stroke="#ccc"
            stroke-width="0.0625em"
          />
          <text
            x=${x}
            y=${xAxisY + 20}
            text-anchor="middle"
            font-size="0.6875em"
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
            stroke-width="0.0625em"
          />
          <text
            x=${padding.left - 10}
            y=${y + 4}
            text-anchor="end"
            font-size="0.6875em"
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

// Render legend for multi-series charts
export function renderLegend(entity, series) {
  if (!entity.showLegend || !series || series.length === 0) return ""

  const { width, padding } = entity
  const legendY = padding.top / 2
  const squareSize = 12
  const gap = 8
  const itemGap = 40

  const totalWidth = series.reduce((acc, s) => {
    const label = s.name || s.label || `Series ${series.indexOf(s) + 1}`

    return acc + squareSize + gap + label.length * 6 + itemGap
  }, 0)

  const startX = (width - totalWidth) / 2
  let currentX = startX

  return svg`
    <g class="iw-chart-legend">
      ${repeat(
        series,
        (s, i) => i,
        (s, i) => {
          const color = s.color || entity.colors[i % entity.colors.length]
          const label = s.name || s.label || `Series ${i + 1}`

          const item = svg`
            <g class="iw-chart-legend-item">
              <rect
                x=${currentX}
                y=${legendY - squareSize / 2}
                width=${squareSize}
                height=${squareSize}
                fill=${color}
                rx="0.125em"
                ry="0.125em"
              />
              <text
                x=${currentX + squareSize + gap}
                y=${legendY + 4}
                text-anchor="start"
                font-size="0.75em"
                fill="#333"
              >
                ${label}
              </text>
            </g>
          `
          currentX += squareSize + gap + label.length * 6 + itemGap
          return item
        },
      )}
    </g>
  `
}

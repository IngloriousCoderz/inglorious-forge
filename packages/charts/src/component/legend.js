/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

/**
 * Legend Component - renderiza legenda independente
 * Recebe dados e cores, não decide layout
 *
 * @param {Object} params
 * @param {any[]} params.series
 * @param {string[]} params.colors
 * @param {number} params.width
 * @param {Object} params.padding
 * @returns {import('lit-html').TemplateResult}
 */
export function renderLegend({ series, colors, width, padding }) {
  if (!series || series.length === 0) {
    return svg``
  }

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
          const color = s.color || colors[i % colors.length]
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

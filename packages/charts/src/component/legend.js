/* eslint-disable no-magic-numbers */

import { repeat,svg } from "@inglorious/web"

/**
 * Legend Component - renders independent legend
 * Receives data and colors, does not decide layout
 *
 * @param {any} entity
 * @param {Object} props
 * @param {any[]} props.series
 * @param {string[]} props.colors
 * @param {number} props.width
 * @param {Object} props.padding
 * @param {any} api
 * @returns {import('lit-html').TemplateResult}
 */
// eslint-disable-next-line no-unused-vars
export function renderLegend(entity, props, api) {
  const { series, colors, width, padding } = props
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
    <g class="iw-chart-legend-wrapper">
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
                class="iw-chart-legend-item-text"
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

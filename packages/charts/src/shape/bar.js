/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { formatNumber } from "../utils/format.js"

/**
 * @param {Object} params
 * @param {any[]} params.data
 * @param {import('d3-scale').ScaleBand} params.xScale
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @param {number} params.height
 * @param {Object} params.padding
 * @param {string[]} params.colors
 * @param {boolean} params.showLabel
 * @returns {import('lit-html').TemplateResult}
 */
export function renderBar({
  data,
  xScale,
  yScale,
  height,
  padding,
  colors,
  showLabel = true,
}) {
  if (!data || data.length === 0) {
    return svg``
  }

  const barWidth = xScale.bandwidth()

  return svg`
    ${repeat(
      data,
      (d, i) => i,
      (d, i) => {
        const category = d.label || d.name || d.category
        const x = xScale(category)
        const y = yScale(d.value)
        const barHeight = height - padding.bottom - y
        const color = d.color || colors[i % colors.length]

        return svg`
          <g>
            <rect
              x=${x}
              y=${y}
              width=${barWidth}
              height=${barHeight}
              fill=${color}
              class="iw-chart-bar"
              rx="0.25em"
              ry="0.25em"
            />
            ${
              showLabel
                ? svg`
                <text
                  x=${x + barWidth / 2}
                  y=${y - 5}
                  text-anchor="middle"
                  font-size="0.6875em"
                  fill="#555"
                  font-weight="500"
                >
                  ${formatNumber(d.value)}
                </text>
              `
                : ""
            }
          </g>
        `
      },
    )}
  `
}

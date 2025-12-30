/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { formatNumber } from "../utils/format.js"

/**
 * @param {Object} params
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @param {Object} params.padding
 * @returns {import('lit-html').TemplateResult}
 */
export function renderYAxis({ yScale, padding }) {
  const ticks = yScale.ticks(5)

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
            >
              ${formatNumber(t)}
            </text>
          </g>
        `
      },
    )}
  `
}

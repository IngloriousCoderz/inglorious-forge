/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { formatNumber, isValidNumber } from "../utils/data-utils.js"

/**
 * @param {Object} params
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @param {number} params.height
 * @param {Object} params.padding
 * @returns {import('lit-html').TemplateResult}
 */
export function renderYAxis({ yScale, height, padding, customTicks }) {
  // Use custom ticks if provided, otherwise use scale ticks
  const ticks =
    customTicks && Array.isArray(customTicks) ? customTicks : yScale.ticks(5)

  // Ensure height and padding are valid numbers
  const axisLineY2 = height - padding.bottom
  if (!isValidNumber(axisLineY2)) {
    return svg``
  }

  return svg`
    <g class="iw-chart-yAxis">
      <!-- Y Axis Line -->
      <line
        x1=${padding.left}
        y1=${padding.top}
        x2=${padding.left}
        y2=${axisLineY2}
        stroke="#ddd"
        stroke-width="0.0625em"
        class="iw-chart-yAxis-line"
      />
      ${repeat(
        ticks,
        (t) => t,
        (t) => {
          const y = yScale(t)
          // Ensure y is a valid number
          if (!isValidNumber(y)) {
            return svg``
          }
          return svg`
            <g class="iw-chart-yAxis-tick">
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
                class="iw-chart-yAxis-tick-label"
              >
                ${formatNumber(t)}
              </text>
            </g>
          `
        },
      )}
    </g>
  `
}

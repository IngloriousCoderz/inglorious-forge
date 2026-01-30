/* eslint-disable no-magic-numbers */

import { repeat,svg } from "@inglorious/web"

import { formatNumber, isValidNumber } from "../utils/data-utils.js"

/**
 * @param {any} entity
 * @param {Object} props
 * @param {import('d3-scale').ScaleLinear} props.yScale
 * @param {number} props.height
 * @param {Object} props.padding
 * @param {Array} props.customTicks
 * @param {any} api
 * @returns {import('lit-html').TemplateResult}
 */
// eslint-disable-next-line no-unused-vars
export function renderYAxis(entity, props, api) {
  const { yScale, height, padding, customTicks } = props
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

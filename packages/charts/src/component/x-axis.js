/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import {
  ensureValidNumber,
  formatDate,
  formatNumber,
  isValidNumber,
} from "../utils/data-utils.js"
import { calculateXTicks } from "../utils/scales.js"

/**
 * @param {Object} params
 * @param {any} params.entity
 * @param {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} params.xScale
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @param {number} params.width
 * @param {number} params.height
 * @param {Object} params.padding
 * @returns {import('lit-html').TemplateResult}
 */
export function renderXAxis({
  entity,
  xScale,
  yScale,
  width,
  height,
  padding,
}) {
  if (xScale.bandwidth) {
    const categories = entity.data.map((d) => d.label || d.name || d.category)
    let xAxisY = height - padding.bottom
    if (yScale) {
      const domain = yScale.domain()
      if (domain[0] < 0) {
        const zeroY = yScale(0)
        if (isValidNumber(zeroY)) {
          xAxisY = zeroY
        }
      }
    }
    // Ensure xAxisY is a valid number
    if (!isValidNumber(xAxisY)) {
      const fallbackY = height - (padding?.bottom || 0)
      xAxisY = ensureValidNumber(fallbackY, height || 0)
    }

    return svg`
    <g class="iw-chart-xAxis">
      <!-- X Axis Line -->
      <line
        x1=${padding?.left || 0}
        y1=${xAxisY}
        x2=${(width || 0) - (padding?.right || 0)}
        y2=${xAxisY}
        stroke="#ddd"
        stroke-width="0.0625em"
        class="iw-chart-xAxis-line"
      />
      ${repeat(
        categories,
        (cat) => cat,
        (cat) => {
          const x = xScale(cat) + xScale.bandwidth() / 2
          // Ensure x is a valid number
          if (!isValidNumber(x)) {
            return svg``
          }
          return svg`
            <text
              x=${x}
              y=${xAxisY + 20}
              text-anchor="middle"
              font-size="0.6875em"
              fill="#777"
              class="iw-chart-xAxis-tick-label"
            >
              ${cat}
            </text>
          `
        },
      )}
    </g>
  `
  }

  // Calculate ticks using helper function
  const ticks = xScale.bandwidth
    ? xScale.domain()
    : calculateXTicks(entity.data, xScale)

  let xAxisY = height - padding.bottom
  if (yScale) {
    const yDomain = yScale.domain()
    if (yDomain[0] < 0) {
      const zeroY = yScale(0)
      if (isValidNumber(zeroY)) {
        xAxisY = zeroY
      }
    }
  }
  // Ensure xAxisY is a valid number
  if (!isValidNumber(xAxisY)) {
    const fallbackY = height - (padding?.bottom || 0)
    xAxisY = ensureValidNumber(fallbackY, height || 0)
  }

  // If entity has xLabels, use them for display (for categorical data)
  const useLabels = entity.xLabels && Array.isArray(entity.xLabels)

  return svg`
    <g class="iw-chart-xAxis">
      <!-- X Axis Line -->
      <line
        x1=${padding?.left || 0}
        y1=${xAxisY}
        x2=${(width || 0) - (padding?.right || 0)}
        y2=${xAxisY}
        stroke="#ddd"
        stroke-width="0.0625em"
        class="iw-chart-xAxis-line"
      />
      ${repeat(
        ticks,
        (t) => t,
        (t, i) => {
          const x = xScale(t)
          // Ensure x is a valid number
          if (!isValidNumber(x)) {
            return svg``
          }
          // Use custom labels if available, otherwise format the tick value
          const label =
            useLabels && entity.xLabels[i] !== undefined
              ? entity.xLabels[i]
              : entity.xAxisType === "time"
                ? formatDate(t)
                : formatNumber(t)

          return svg`
            <g class="iw-chart-xAxis-tick">
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
                class="iw-chart-xAxis-tick-label"
              >${label}</text>
            </g>
          `
        },
      )}
    </g>
  `
}

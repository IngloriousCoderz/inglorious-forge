/* eslint-disable no-magic-numbers */

import { repeat,svg } from "@inglorious/web"

import {
  ensureValidNumber,
  formatDate,
  formatNumber,
  isValidNumber,
} from "../utils/data-utils.js"
import { calculateXTicks } from "../utils/scales.js"

/**
 * @param {any} entity
 * @param {Object} props
 * @param {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} props.xScale
 * @param {import('d3-scale').ScaleLinear} props.yScale
 * @param {number} props.width
 * @param {number} props.height
 * @param {Object} props.padding
 * @param {any} api
 * @returns {import('lit-html').TemplateResult}
 */

// eslint-disable-next-line no-unused-vars
export function renderXAxis(entity, props, api) {
  const { xScale, yScale, width, height, padding } = props

  if (xScale.bandwidth) {
    // Following Recharts logic: for scaleBand, use the domain directly
    // and calculate the center as scale(category) + bandwidth() / 2
    const allCategories = xScale.domain()
    if (allCategories.length === 0) {
      return svg`<g class="iw-chart-xAxis"></g>`
    }

    // Limit number of ticks to avoid overlapping labels
    // Similar to Recharts behavior: show fewer ticks when there are many categories
    let categories = allCategories
    if (allCategories.length > 20) {
      // Calculate optimal number of ticks based on available width
      // Estimate ~60px per label to avoid overlap
      const availableWidth =
        (width || 800) - (padding?.left || 0) - (padding?.right || 0)
      const maxTicks = Math.max(5, Math.floor(availableWidth / 60))
      const step = Math.ceil(allCategories.length / maxTicks)
      categories = allCategories.filter((_, i) => i % step === 0)
    }

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

    // Offset for scaleBand: bandwidth() / 2 (as in Recharts)
    // bandwidth() returns the available band width (without internal padding)
    // Following Recharts logic exactly: offsetForBand = bandwidth() / 2
    const bandwidth = xScale.bandwidth()
    if (!isValidNumber(bandwidth) || bandwidth <= 0) {
      // If bandwidth is not valid, don't render the axis
      return svg`<g class="iw-chart-xAxis"></g>`
    }
    const offsetForBand = bandwidth / 2

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
          // Following Recharts: coordinate = scale(category) + offset
          // where offset = bandwidth() / 2 for scaleBand
          // xScale(cat) returns the initial position of the band (including external padding)
          // We add bandwidth() / 2 to get the center of the band
          const scaled = xScale(cat)
          if (scaled == null || !isValidNumber(scaled)) {
            return svg``
          }
          const coordinate = scaled + offsetForBand
          // Ensure coordinate is a valid number
          if (!isValidNumber(coordinate)) {
            return svg``
          }
          return svg`
            <g class="iw-chart-xAxis-tick">
              <!-- Tick line (vertical line) - uses the same coordinate -->
              <line
                x1=${coordinate}
                y1=${xAxisY}
                x2=${coordinate}
                y2=${xAxisY + 5}
                stroke="#ccc"
                stroke-width="0.0625em"
              />
              <!-- Label - usa a mesma coordinate -->
              <text
                x=${coordinate}
                y=${xAxisY + 20}
                text-anchor="middle"
                font-size="0.6875em"
                fill="#777"
                class="iw-chart-xAxis-tick-label"
              >
                ${cat}
              </text>
            </g>
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

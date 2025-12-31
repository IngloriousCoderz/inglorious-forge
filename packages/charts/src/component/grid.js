/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { calculateXTicks } from "../utils/scales.js"

/**
 * Grid Component - renderiza grid independente
 * Recebe escalas do contexto, não decide layout
 *
 * @param {Object} params
 * @param {any} params.entity - Chart entity with data
 * @param {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} params.xScale
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @param {number} params.width
 * @param {number} params.height
 * @param {Object} params.padding
 * @returns {import('lit-html').TemplateResult}
 */
export function renderGrid({ entity, xScale, yScale, width, height, padding }) {
  // Use entity.data if available, otherwise fallback to scale ticks
  const data = entity?.data
  const xTicks = xScale.bandwidth
    ? xScale.domain()
    : data && data.length > 0
      ? calculateXTicks(data, xScale)
      : xScale.ticks ? xScale.ticks(5) : xScale.domain()
  const yTicks = yScale.ticks(5)

  return svg`
    <!-- Vertical grid lines -->
    ${repeat(
      xTicks,
      (t) => t,
      (t) => {
        // For band scales (bar charts), center the grid line in the middle of the band
        // For linear/time scales, use the tick position directly
        const x = xScale.bandwidth
          ? xScale(t) + xScale.bandwidth() / 2
          : xScale(t)
        // Only render if x is a valid number within the range
        if (isNaN(x) || x < padding.left || x > width - padding.right) {
          return svg``
        }
        return svg`
          <line
            x1=${x}
            y1=${padding.top}
            x2=${x}
            y2=${height - padding.bottom}
            stroke="#e5e7eb"
            stroke-width="0.0625em"
            stroke-dasharray="0.25em 0.25em"
          />
        `
      },
    )}
    <!-- Horizontal grid lines -->
    ${repeat(
      yTicks,
      (t) => t,
      (t) => {
        const y = yScale(t)
        return svg`
          <line
            x1=${padding.left}
            y1=${y}
            x2=${width - padding.right}
            y2=${y}
            stroke="#e5e7eb"
            stroke-width="0.0625em"
            stroke-dasharray="0.25em 0.25em"
          />
        `
      },
    )}
  `
}

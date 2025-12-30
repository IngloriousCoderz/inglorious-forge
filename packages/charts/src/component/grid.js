/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

/**
 * Grid Component - renderiza grid independente
 * Recebe escalas do contexto, não decide layout
 *
 * @param {Object} params
 * @param {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} params.xScale
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @param {number} params.width
 * @param {number} params.height
 * @param {Object} params.padding
 * @returns {import('lit-html').TemplateResult}
 */
export function renderGrid({ xScale, yScale, width, height, padding }) {
  const xTicks = xScale.ticks ? xScale.ticks(5) : xScale.domain()
  const yTicks = yScale.ticks(5)

  return svg`
    <!-- Vertical grid lines -->
    ${repeat(
      xTicks,
      (t) => t,
      (t) => {
        const x = xScale(t)
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

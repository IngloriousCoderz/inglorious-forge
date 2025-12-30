/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"
import { repeat } from "lit-html/directives/repeat.js"

import { formatDate, formatNumber } from "../utils/format.js"

/**
 * @param {Object} params
 * @param {any} params.entity
 * @param {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} params.xScale
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @param {number} params.height
 * @param {Object} params.padding
 * @returns {import('lit-html').TemplateResult}
 */
export function renderXAxis({ entity, xScale, yScale, height, padding }) {
  if (xScale.bandwidth) {
    const categories = entity.data.map((d) => d.label || d.name || d.category)
    let xAxisY = height - padding.bottom
    if (yScale) {
      const domain = yScale.domain()
      if (domain[0] < 0) {
        xAxisY = yScale(0)
      }
    }

    return svg`
      ${repeat(
        categories,
        (cat) => cat,
        (cat) => {
          const x = xScale(cat) + xScale.bandwidth() / 2
          return svg`
            <text
              x=${x}
              y=${xAxisY + 20}
              text-anchor="middle"
              font-size="0.6875em"
              fill="#777"
            >
              ${cat}
            </text>
          `
        },
      )}
    `
  }

  const ticks = xScale.ticks ? xScale.ticks(5) : xScale.domain()
  let xAxisY = height - padding.bottom
  if (yScale) {
    const domain = yScale.domain()
    if (domain[0] < 0) {
      xAxisY = yScale(0)
    }
  }

  return svg`
    ${repeat(
      ticks,
      (t) => t,
      (t) => {
        const x = xScale(t)
        const label =
          entity.xAxisType === "time" ? formatDate(t) : formatNumber(t)

        return svg`
          <g>
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
            >${label}</text>
          </g>
        `
      },
    )}
  `
}


/* eslint-disable no-magic-numbers */

import { svg } from "lit-html"

/**
 * AxisLines Component - renderiza linhas dos eixos
 * Recebe escalas do contexto, não decide layout
 *
 * @param {Object} params
 * @param {number} params.width
 * @param {number} params.height
 * @param {Object} params.padding
 * @param {import('d3-scale').ScaleLinear} params.yScale
 * @returns {import('lit-html').TemplateResult}
 */
export function renderAxisLines({ width, height, padding, yScale }) {
  let xAxisY = height - padding.bottom
  if (yScale) {
    const domain = yScale.domain()
    if (domain[0] < 0) {
      xAxisY = yScale(0)
    }
  }

  return svg`
    <!-- Eixo X -->
    <line
      x1=${padding.left}
      y1=${xAxisY}
      x2=${width - padding.right}
      y2=${xAxisY}
      stroke="#ddd"
      stroke-width="0.0625em"
    />
    <!-- Eixo Y -->
    <line
      x1=${padding.left}
      y1=${padding.top}
      x2=${padding.left}
      y2=${height - padding.bottom}
      stroke="#ddd"
      stroke-width="0.0625em"
    />
  `
}

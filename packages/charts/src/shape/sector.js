/* eslint-disable no-magic-numbers */

import { svg } from "@inglorious/web"

import { generateArcPath } from "../utils/paths.js"

/**
 * Renders a single sector (pie slice) - primitive shape
 * Similar to Recharts Sector component
 *
 * @param {Object} params
 * @param {number} params.innerRadius - Inner radius
 * @param {number} params.outerRadius - Outer radius
 * @param {number} params.startAngle - Start angle in radians
 * @param {number} params.endAngle - End angle in radians
 * @param {number} params.centerX - Center X
 * @param {number} params.centerY - Center Y
 * @param {string} [params.fill] - Fill color
 * @param {string} [params.className] - CSS class
 * @param {number} [params.cornerRadius] - Corner radius for rounded edges
 * @param {Function} [params.onMouseEnter] - Mouse enter handler
 * @param {Function} [params.onMouseLeave] - Mouse leave handler
 * @param {number|string} [params.dataIndex] - Data index for tracking
 * @returns {import('lit-html').TemplateResult}
 */
export function renderSector({
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  centerX,
  centerY,
  fill,
  className = "iw-chart-sector",
  cornerRadius = 0,
  onMouseEnter,
  onMouseLeave,
  dataIndex,
}) {
  return svg`
    <g transform="translate(${centerX}, ${centerY})">
      <path
        d=${generateArcPath(
          innerRadius,
          outerRadius,
          startAngle,
          endAngle,
          cornerRadius,
        )}
        fill=${fill}
        class=${className}
        data-slice-index=${dataIndex}
        @mouseenter=${onMouseEnter}
        @mouseleave=${onMouseLeave}
      />
    </g>
  `
}

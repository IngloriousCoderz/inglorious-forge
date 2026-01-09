import { svg } from "lit-html"

/**
 * Renders a single rectangle (primitive shape)
 * Similar to Recharts Rectangle component
 *
 * @param {Object} params
 * @param {number} params.x - X position
 * @param {number} params.y - Y position
 * @param {number} params.width - Width
 * @param {number} params.height - Height
 * @param {string} [params.fill] - Fill color
 * @param {string} [params.className] - CSS class
 * @param {number|string} [params.rx] - Border radius X
 * @param {number|string} [params.ry] - Border radius Y
 * @param {Function} [params.onMouseEnter] - Mouse enter handler
 * @param {Function} [params.onMouseLeave] - Mouse leave handler
 * @returns {import('lit-html').TemplateResult}
 */
export function renderRectangle({
  x,
  y,
  width,
  height,
  fill,
  className = "iw-chart-rectangle",
  rx = "0.25em",
  ry = "0.25em",
  onMouseEnter,
  onMouseLeave,
}) {
  return svg`
    <rect
      x=${x}
      y=${y}
      width=${width}
      height=${height}
      fill=${fill}
      class=${className}
      rx=${rx}
      ry=${ry}
      @mouseenter=${onMouseEnter}
      @mouseleave=${onMouseLeave}
    />
  `
}

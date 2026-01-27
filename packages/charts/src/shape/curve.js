import { svg } from "lit-html"

/**
 * Renders a single curve/path (primitive shape)
 * Similar to Recharts Curve component
 *
 * @param {Object} params
 * @param {string} params.d - Path data (SVG path string)
 * @param {string} [params.stroke] - Stroke color
 * @param {string} [params.fill] - Fill color
 * @param {string} [params.fillOpacity] - Fill opacity
 * @param {string} [params.strokeWidth] - Stroke width
 * @param {string} [params.className] - CSS class
 * @param {Function} [params.onMouseEnter] - Mouse enter handler
 * @param {Function} [params.onMouseLeave] - Mouse leave handler
 * @returns {import('lit-html').TemplateResult}
 */
export function renderCurve({
  d,
  stroke,
  fill = "none",
  fillOpacity,
  strokeWidth = "0.15625em",
  className = "iw-chart-curve",
  entityId,
  onMouseEnter,
  onMouseLeave,
}) {
  const wrappedOnMouseEnter = onMouseEnter
    ? (e) => {
        onMouseEnter(e)
      }
    : undefined

  const wrappedOnMouseLeave = onMouseLeave
    ? (e) => {
        onMouseLeave(e)
      }
    : undefined

  return svg`
    <path
      d=${d}
      stroke=${stroke}
      fill=${fill}
      fill-opacity=${fillOpacity}
      stroke-width=${strokeWidth}
      class=${className}
      data-entity-id=${entityId || undefined}
      style=${stroke ? `stroke: ${stroke} !important;` : undefined}
      @mouseenter=${wrappedOnMouseEnter}
      @mouseleave=${wrappedOnMouseLeave}
    />
  `
}

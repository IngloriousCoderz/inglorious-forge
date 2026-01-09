import { svg } from "lit-html"

/**
 * Renders an empty state message when there's no data
 * @param {Object} params
 * @param {number} params.width - Chart width
 * @param {number} params.height - Chart height
 * @param {string} [params.message="No data"] - Message to display
 * @returns {import('lit-html').TemplateResult}
 */
export function renderEmptyState({ width, height, message = "No data" }) {
  return svg`
    <svg
      width=${width}
      height=${height}
      viewBox="0 0 ${width} ${height}"
    >
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        fill="#999"
        font-size="0.875em"
      >
        ${message}
      </text>
    </svg>
  `
}

import { svg } from "@inglorious/web"

/**
 * Renders an empty state message when there's no data
 * @param {any} entity
 * @param {Object} props
 * @param {number} props.width - Chart width
 * @param {number} props.height - Chart height
 * @param {string} [props.message="No data"] - Message to display
 * @param {any} api
 * @returns {import('lit-html').TemplateResult}
 */
// eslint-disable-next-line no-unused-vars
export function renderEmptyState(entity, props, api) {
  const { width, height, message = "No data" } = props
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

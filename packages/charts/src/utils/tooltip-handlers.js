/**
 * Tooltip event handlers utilities
 * Creates reusable onMouseEnter, onMouseLeave, and onMouseMove handlers for chart elements
 */

// Tooltip offset from cursor position
const TOOLTIP_OFFSET = 15
// Estimated tooltip width (can be adjusted based on actual tooltip size)
const TOOLTIP_ESTIMATED_WIDTH = 140
// Estimated tooltip height
const TOOLTIP_ESTIMATED_HEIGHT = 60

/**
 * Calculates tooltip position, adjusting if it would be cut off
 * @param {number} x - X position relative to SVG
 * @param {number} y - Y position relative to SVG
 * @param {DOMRect} svgRect - SVG bounding rect
 * @param {DOMRect} containerRect - Container bounding rect (for overflow check)
 * @returns {{ x: number, y: number }}
 */
function calculateTooltipPosition(x, y, svgRect, containerRect) {
  let tooltipX = x + TOOLTIP_OFFSET
  let tooltipY = y - TOOLTIP_OFFSET

  // Check if tooltip would be cut off on the right side
  const tooltipRightEdge = svgRect.left + tooltipX + TOOLTIP_ESTIMATED_WIDTH
  const containerRightEdge = containerRect.right

  if (tooltipRightEdge > containerRightEdge) {
    // Position tooltip to the left of cursor instead
    tooltipX = x - TOOLTIP_ESTIMATED_WIDTH - TOOLTIP_OFFSET
    // Ensure it doesn't go negative
    const MIN_X_POSITION = 0
    if (tooltipX < MIN_X_POSITION) {
      tooltipX = TOOLTIP_OFFSET
    }
  }

  // Check if tooltip would be cut off on the bottom
  const tooltipBottomEdge = svgRect.top + tooltipY + TOOLTIP_ESTIMATED_HEIGHT
  const containerBottomEdge = containerRect.bottom

  if (tooltipBottomEdge > containerBottomEdge) {
    // Position tooltip above cursor
    tooltipY = y - TOOLTIP_ESTIMATED_HEIGHT - TOOLTIP_OFFSET
  }

  return { x: tooltipX, y: tooltipY }
}

/**
 * Creates tooltip event handlers for chart elements
 * @param {Object} params
 * @param {any} params.entity - Chart entity
 * @param {import('@inglorious/web').Api} params.api - Web API instance
 * @param {Object} params.tooltipData - Tooltip data
 * @param {string} params.tooltipData.label - Tooltip label
 * @param {number} params.tooltipData.value - Tooltip value
 * @param {string} params.tooltipData.color - Tooltip color
 * @returns {{ onMouseEnter: Function, onMouseLeave: Function }}
 */
export function createTooltipHandlers({ entity, api, tooltipData }) {
  const onMouseEnter = (e) => {
    if (!entity.showTooltip) return
    const svgElement = e.currentTarget.closest("svg")
    const svgRect = svgElement.getBoundingClientRect()
    const containerElement =
      svgElement.closest(".iw-chart") || svgElement.parentElement
    const containerRect = containerElement.getBoundingClientRect()

    const relativeX = e.clientX - svgRect.left
    const relativeY = e.clientY - svgRect.top

    const { x, y } = calculateTooltipPosition(
      relativeX,
      relativeY,
      svgRect,
      containerRect,
    )

    api.notify(`#${entity.id}:showTooltip`, {
      label: tooltipData.label,
      value: tooltipData.value,
      color: tooltipData.color,
      x,
      y,
    })
  }

  const onMouseLeave = () => {
    if (!entity.showTooltip) return
    api.notify(`#${entity.id}:hideTooltip`)
  }

  return { onMouseEnter, onMouseLeave }
}

/**
 * Creates a mouse move handler for tooltip positioning
 * @param {Object} params
 * @param {any} params.entity - Chart entity
 * @param {import('@inglorious/web').Api} params.api - Web API instance
 * @returns {Function} Mouse move event handler
 */
export function createTooltipMoveHandler({ entity, api }) {
  return (e) => {
    if (!entity.tooltip) return
    const svgElement = e.currentTarget
    const svgRect = svgElement.getBoundingClientRect()
    const containerElement =
      svgElement.closest(".iw-chart") || svgElement.parentElement
    const containerRect = containerElement.getBoundingClientRect()

    const relativeX = e.clientX - svgRect.left
    const relativeY = e.clientY - svgRect.top

    const { x, y } = calculateTooltipPosition(
      relativeX,
      relativeY,
      svgRect,
      containerRect,
    )

    api.notify(`#${entity.id}:moveTooltip`, {
      x,
      y,
    })
  }
}

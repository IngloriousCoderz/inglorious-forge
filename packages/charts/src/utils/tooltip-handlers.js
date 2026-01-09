/**
 * Tooltip event handlers utilities
 * Creates reusable onMouseEnter, onMouseLeave, and onMouseMove handlers for chart elements
 */

// Tooltip offset from cursor position
const TOOLTIP_OFFSET = 15

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
    const rect = e.currentTarget.closest("svg").getBoundingClientRect()
    api.notify(`#${entity.id}:showTooltip`, {
      label: tooltipData.label,
      value: tooltipData.value,
      color: tooltipData.color,
      x: e.clientX - rect.left + TOOLTIP_OFFSET,
      y: e.clientY - rect.top - TOOLTIP_OFFSET,
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
    const rect = e.currentTarget.getBoundingClientRect()
    api.notify(`#${entity.id}:moveTooltip`, {
      x: e.clientX - rect.left + TOOLTIP_OFFSET,
      y: e.clientY - rect.top - TOOLTIP_OFFSET,
    })
  }
}

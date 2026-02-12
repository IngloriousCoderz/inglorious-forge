/**
 * Processes declarative child objects (intention objects) into rendered functions
 * Converts { type: 'XAxis', config } into a rendered function by calling the appropriate render method
 *
 * @param {Object} child - Child object with type and config properties
 * @param {Object} entity - Chart entity
 * @param {string} chartTypeName - Chart type name ("line", "area", "bar", "pie")
 * @param {Object} api - Web API instance
 * @returns {Function|null} Rendered function or null if not found
 */
export function processDeclarativeChild(child, entity, chartTypeName, api) {
  if (
    child &&
    typeof child === "object" &&
    child.type &&
    child.config !== undefined
  ) {
    const chartType = api.getType(chartTypeName)
    const methodName = `render${child.type}`
    if (chartType?.[methodName]) {
      return chartType[methodName](entity, { config: child.config }, api)
    }
  }
  return child
}

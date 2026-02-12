/**
 * Processes declarative child objects (intention objects) into rendered functions
 * Converts { type: 'XAxis', config } into a rendered function
 *
 * @param {Object} child - Child object with type and config properties
 * @param {Object} entity - Chart entity
 * @param {string} chartTypeName - Chart type name
 * @param {Object} api - Web API instance
 * @returns {Function|null}
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
      // Execute the render method to get the actual component function (e.g., brushFn)
      const rendered = chartType[methodName](
        entity,
        { config: child.config },
        api,
      )

      // Inject flag based on the declarative object TYPE
      // This ensures the returned function has the correct flag for identification
      if (typeof rendered === "function") {
        if (child.type === "Brush") rendered.isBrush = true
        if (child.type === "XAxis" || child.type === "YAxis")
          rendered.isAxis = true
        if (child.type === "CartesianGrid") rendered.isGrid = true
        if (child.type === "Line") rendered.isLine = true
        if (child.type === "Dots") rendered.isDots = true
        if (child.type === "Tooltip") rendered.isTooltip = true
        if (child.type === "Legend") rendered.isLegend = true
      }

      return rendered
    }
  }
  return child
}

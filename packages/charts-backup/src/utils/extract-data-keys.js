/**
 * Extracts dataKeys from chart children components automatically.
 * This allows the chart to determine which data fields to use for Y-axis scaling
 * without requiring explicit dataKeys configuration.
 *
 * @param {Array|Function} children - Array of chart child components (Line, Area, Bar, etc.)
 * @returns {Array<string>} Array of unique dataKeys found in the children
 */
export function extractDataKeysFromChildren(children) {
  const dataKeys = new Set()
  const childrenArray = Array.isArray(children) ? children : [children]

  for (const child of childrenArray) {
    if (typeof child === "function") {
      if (child.dataKey) {
        dataKeys.add(child.dataKey)
      }
    }
  }

  return Array.from(dataKeys)
}

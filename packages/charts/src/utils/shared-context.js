/* eslint-disable no-magic-numbers */

import { parseDimension } from "./data-utils.js"
import { calculatePadding } from "./padding.js"
import { createCartesianContext } from "./scales.js"

/**
 * Calculates the maximum value (extent) from entity data.
 * If dataKeys are provided (composition mode), only considers those keys.
 * Otherwise considers all numeric values (config-first mode).
 *
 * @param {any[]} data - Chart data array
 * @param {Set<string>|null} usedDataKeys - Set of data keys to consider (composition mode)
 * @returns {number} Maximum value found
 */
function getExtent(data, usedDataKeys) {
  if (!data || data.length === 0) return 0

  const values = data.flatMap((d) => {
    if (usedDataKeys && usedDataKeys.size > 0) {
      // Composition mode: only use values from dataKeys used in lines/areas
      return Array.from(usedDataKeys)
        .map((dataKey) => {
          const value = d[dataKey]
          return typeof value === "number" ? value : 0
        })
        .filter((v) => v > 0)
    } else {
      // Config-first mode: use all numeric values (excluding name, x, date)
      return Object.entries(d)
        .filter(
          ([key, value]) =>
            !["name", "x", "date"].includes(key) && typeof value === "number",
        )
        .map(([, value]) => value)
    }
  })

  return values.length > 0 ? Math.max(...values) : 0
}

/**
 * Creates a shared context for composition mode charts.
 * Calculates scales, dimensions, and provides a context object for child components.
 *
 * This function unifies the context creation logic for line, area, and bar charts.
 * Follows the standard signature pattern: render<Sub>(entity, props, api)
 *
 * @param {any} entity - Chart entity with data
 * @param {Object} props - Configuration options
 * @param {number|string} [props.width] - Chart width (overrides entity.width)
 * @param {number|string} [props.height] - Chart height (overrides entity.height)
 * @param {Object} [props.padding] - Chart padding (overrides calculated padding)
 * @param {Set<string>|string[]|null} [props.usedDataKeys] - Data keys to use for Y-scale calculation (composition mode)
 * @param {string} [props.chartType="line"] - Chart type ("line", "area", "bar")
 * @param {any} api - Web API instance (not used, but follows standard signature)
 * @returns {Object} Context object with xScale, yScale, dimensions, and entity
 */
// eslint-disable-next-line no-unused-vars
export function createSharedContext(entity, props = {}, api) {
  if (!entity || !entity.data) {
    throw new Error("Entity and entity.data are required")
  }

  // Extract props with defaults
  const {
    width: configWidth,
    height: configHeight,
    padding: configPadding,
    usedDataKeys: configDataKeys,
    chartType = "line",
  } = props

  // Calculate dimensions
  const width =
    parseDimension(configWidth) || parseDimension(entity.width) || 800
  const height =
    parseDimension(configHeight) || parseDimension(entity.height) || 400
  const padding = configPadding || calculatePadding(width, height)

  // Convert dataKeys array to Set if needed
  const usedDataKeys =
    configDataKeys instanceof Set
      ? configDataKeys
      : Array.isArray(configDataKeys)
        ? new Set(configDataKeys)
        : null

  // Calculate maximum value for Y-axis scaling (global max across all data)
  const maxValue = getExtent(entity.data, usedDataKeys)

  // Create data structure for scale calculation
  // Keep all points with indices for xScale domain, but use global max for yScale
  // This ensures xScale has correct domain [0, data.length-1] and yScale has [0, maxValue]
  const dataForScale = entity.data.map((d, i) => ({
    x: i,
    y: maxValue,
  }))

  // Create entity with transformed data and dimensions for scale creation
  const entityWithDimensions = {
    ...entity,
    data: dataForScale,
    width,
    height,
    padding,
  }

  // Create cartesian context with scales
  const context = createCartesianContext(entityWithDimensions, chartType)

  // Return enhanced context with original entity reference
  return {
    ...context,
    dimensions: { width, height, padding },
    entity, // Keep reference to original entity (not transformed data)
  }
}

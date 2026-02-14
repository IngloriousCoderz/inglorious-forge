/* eslint-disable no-magic-numbers */

import { parseDimension } from "./data-utils.js"
import { calculatePadding } from "./padding.js"
import { createScales } from "./scales.js"

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
    stacked = false,
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

  // CRITICAL: Y scale should ALWAYS use original (unfiltered) data
  // The brush zoom should only affect X-axis, not Y-axis
  // This ensures consistent Y-axis scale regardless of brush selection
  // Use original entity data for Y scale calculation (not filtered)
  const dataForYExtent = entity.data

  // Calculate maximum value for Y-axis scaling (global max across ALL data)
  const maxValue = getExtent(dataForYExtent, usedDataKeys, stacked)

  // Create data structure for scale calculation
  // For X scale: use original data (not filtered) to preserve original x/date values
  // For Y scale: use maxValue calculated from ALL data (not filtered)
  // This ensures xScale has correct domain based on original data, and yScale has [0, maxValue]
  // The brush zoom will be applied later by adjusting xScale.domain([startIndex, endIndex])
  // Note: dataForYScale is just a placeholder structure for createYScale
  const dataForYScale = dataForYExtent.map((d, i) => ({
    x: i,
    y: maxValue,
  }))

  // Create entities with correct data for each scale
  // X scale uses original data to preserve x/date values
  const entityForXScale = {
    ...entity,
    data: entity.data, // Use original data for X scale
    width,
    height,
    padding,
  }

  // Y scale uses transformed data with maxValue
  const entityForYScale = {
    ...entity,
    data: dataForYScale,
    width,
    height,
    padding,
  }

  // Create scales separately: X scale uses original data, Y scale uses transformed data
  // For X scale, we need to ensure it uses original data even if brush is enabled
  // So we temporarily disable brush filtering for X scale creation
  const entityForXScaleNoBrush = {
    ...entityForXScale,
    brush: entityForXScale.brush
      ? { ...entityForXScale.brush, enabled: false }
      : undefined,
  }
  const { xScale } = createScales(entityForXScaleNoBrush, chartType)
  const { yScale } = createScales(entityForYScale, chartType)

  // Create context with the correct scales
  const context = {
    xScale,
    yScale,
    dimensions: { width, height, padding },
    entity,
  }

  // Return enhanced context with original entity reference
  return {
    ...context,
    dimensions: { width, height, padding },
    entity, // Keep reference to original entity (not transformed data)
    chartType, // Include chartType in context for lazy components
  }
}

/**
 * Calculates the maximum value (extent) from entity data.
 * If dataKeys are provided (composition mode), only considers those keys.
 * Otherwise considers all numeric values (config-first mode).
 *
 * @param {any[]} data - Chart data array
 * @param {Set<string>|null} usedDataKeys - Set of data keys to consider (composition mode)
 * @returns {number} Maximum value found
 */
function getExtent(data, usedDataKeys, stacked = false) {
  if (!data || data.length === 0) return 0

  const values = data.flatMap((d) => {
    if (usedDataKeys && usedDataKeys.size > 0) {
      // Composition mode: only use values from dataKeys used in lines/areas
      // If stacked, use the sum across keys per datum to determine max Y.
      const keys = Array.from(usedDataKeys)
      if (stacked) {
        const sum = keys.reduce((acc, dataKey) => {
          const value = d[dataKey]
          return acc + (typeof value === "number" ? value : 0)
        }, 0)
        return [sum].filter((v) => v > 0)
      }

      return keys
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

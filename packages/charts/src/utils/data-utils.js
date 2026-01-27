/* eslint-disable no-magic-numbers */

/**
 * Data utilities
 * Functions for data manipulation and formatting
 */

import { format } from "d3-format"
import { timeFormat } from "d3-time-format"

/**
 * Format a number with the specified format
 * @param {number} value - Number to format
 * @param {string} [fmt=",.2f"] - Format string (d3-format syntax)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, fmt = ",.2f") {
  return format(fmt)(value)
}

/**
 * Format a date with the specified format
 * @param {Date|string|number} date - Date to format
 * @param {string} [fmt="%Y-%m-%d"] - Format string (d3-time-format syntax)
 * @returns {string} Formatted date string
 */
export function formatDate(date, fmt = "%Y-%m-%d") {
  return timeFormat(fmt)(new Date(date))
}

/**
 * Gets values from a series object
 * @param {any} series - Series object that may have a values array or be a single value
 * @returns {any[]} Array of values
 */
export function getSeriesValues(series) {
  return Array.isArray(series.values) ? series.values : [series]
}

/**
 * Checks if the data represents multiple series
 * @param {any[]} data - Chart data array
 * @returns {boolean} True if data represents multiple series (has values array)
 */
export function isMultiSeries(data) {
  return (
    Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.values)
  )
}

/**
 * Gets the X coordinate value from a data point
 * @param {any} d - Data point object
 * @param {any} [fallback=0] - Fallback value if x/date is not found
 * @returns {any} X coordinate value (x, date, or fallback)
 */
export function getDataPointX(d, fallback = 0) {
  return d?.x ?? d?.date ?? fallback
}

/**
 * Gets the Y coordinate value from a data point
 * @param {any} d - Data point object
 * @param {any} [fallback=0] - Fallback value if y/value is not found
 * @returns {any} Y coordinate value (y, value, or fallback)
 */
export function getDataPointY(d, fallback = 0) {
  return d?.y ?? d?.value ?? fallback
}

/**
 * Gets the label from a data point
 * @param {any} d - Data point object
 * @param {string} [fallback="Value"] - Fallback label if x/date is not found
 * @returns {string} Label value (x, date, or fallback)
 */
export function getDataPointLabel(d, fallback = "Value") {
  return d?.x ?? d?.date ?? fallback
}

/**
 * Checks if a value is a valid number (not NaN and finite)
 * @param {any} value - Value to check
 * @returns {boolean} True if value is a valid number
 */
export function isValidNumber(value) {
  return typeof value === "number" && !isNaN(value) && isFinite(value)
}

/**
 * Ensures a value is a valid number, returning a fallback if not
 * @param {any} value - Value to validate
 * @param {number} [fallback=0] - Fallback value if validation fails
 * @returns {number} Valid number value
 */
export function ensureValidNumber(value, fallback = 0) {
  return isValidNumber(value) ? value : fallback
}

/**
 * Transforms entity data to standardized format with x, y, and name properties.
 * Used for rendering lines and areas in composition mode.
 *
 * @param {any} entity - Chart entity with data
 * @param {string} dataKey - Data key to extract values from
 * @returns {Array|null} Transformed data array or null if entity/data is invalid
 */
export function getTransformedData(entity, dataKey) {
  if (!entity || !entity.data) return null

  // Transform data to use indices for x (like Recharts does with categorical data)
  return entity.data.map((d, i) => ({
    x: i, // Use index for positioning
    y: d[dataKey] !== undefined ? d[dataKey] : d.y || d.value || 0,
    name: d[dataKey] || d.name || d.x || d.date || i, // Keep name for labels
  }))
}

/**
 * Parses a dimension value (width/height) from config or entity
 * Returns numeric value if possible, undefined otherwise
 * @param {number|string|undefined} value - Dimension value to parse
 * @returns {number|undefined} Parsed numeric value or undefined
 */
export function parseDimension(value) {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    // Try to parse as number (e.g., "800" -> 800)
    const num = parseFloat(value)
    if (!isNaN(num) && !value.includes("%") && !value.includes("px")) {
      return num
    }
  }
  return undefined
}

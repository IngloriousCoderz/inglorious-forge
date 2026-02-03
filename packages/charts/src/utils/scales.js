/* eslint-disable no-magic-numbers */

import { extent } from "d3-array"
import { scaleBand, scaleLinear, scaleTime } from "d3-scale"

import { getDataPointX, getDataPointY, isMultiSeries } from "./data-utils.js"

export function createYScale(data, height, padding, isStacked = false) {
  let values
  if (isMultiSeries(data)) {
    if (isStacked) {
      // For stacked areas, calculate the sum of all series at each point
      const allSeriesValues = data.map((series) =>
        Array.isArray(series.values) ? series.values : [series],
      )
      const maxLength = Math.max(...allSeriesValues.map((s) => s.length))

      // Calculate stacked sums for each x position
      values = []
      for (let i = 0; i < maxLength; i++) {
        let sum = 0
        allSeriesValues.forEach((seriesValues) => {
          const point = seriesValues[i]
          if (point) {
            sum += point.y ?? point.value ?? 0
          }
        })
        values.push(sum)
      }
    } else {
      // For non-stacked (line charts), use all individual values
      values = data.flatMap((series) =>
        Array.isArray(series.values)
          ? series.values.map((v) => v.y ?? v.value ?? 0)
          : [series.y ?? series.value ?? 0],
      )
    }
  } else {
    // Single series: extract directly
    values = data.map((d) => getDataPointY(d))
  }

  const [minVal, maxVal] = extent(values)
  // Always start at 0 to avoid visual distortions
  const min = Math.min(0, minVal ?? 0)
  const max = maxVal ?? 100
  return scaleLinear()
    .domain([min, max])
    .nice() // Make domain "nice" (round to nice numbers like 1000 instead of 980)
    .range([height - padding.bottom, padding.top])
}

export function createXScale(data, width, padding) {
  // Handle multi-series data (array of series with values)
  let values
  if (isMultiSeries(data)) {
    // Extract all x values from all series
    values = data.flatMap((series) =>
      series.values ? series.values.map((v) => v.x ?? v.date) : [],
    )
  } else {
    // Single series: extract directly
    values = data.map((d, i) => getDataPointX(d, i))
  }

  // Filter out null/undefined values and ensure we have valid numbers
  const validValues = values.filter((v) => v != null && !isNaN(v))

  if (validValues.length === 0) {
    console.warn(
      "[createXScale] No valid x values found, using default domain [0, data.length-1]",
    )
    return scaleLinear()
      .domain([0, data.length - 1])
      .range([padding.left, width - padding.right])
  }

  const [minVal, maxVal] = extent(validValues)
  if (minVal == null || maxVal == null || isNaN(minVal) || isNaN(maxVal)) {
    console.warn(
      "[createXScale] Invalid extent, using default domain [0, data.length-1]",
      { minVal, maxVal, values, validValues },
    )
    return scaleLinear()
      .domain([0, data.length - 1])
      .range([padding.left, width - padding.right])
  }

  return scaleLinear()
    .domain([minVal, maxVal])
    .range([padding.left, width - padding.right])
}

export function createTimeScale(data, width, padding) {
  const dates = data.map((d) => new Date(d.date ?? d.x))
  const [minDate, maxDate] = extent(dates)
  return scaleTime()
    .domain([minDate, maxDate])
    .range([padding.left, width - padding.right])
}

export function createOrdinalScale(categories, width, padding) {
  return scaleBand()
    .domain(categories)
    .range([padding.left, width - padding.right])
    .padding(0.1)
}

/**
 * Get filtered data based on brush state
 * @param {any} entity - Chart entity
 * @returns {any[]} Filtered data array
 */
export function getFilteredData(entity) {
  if (!entity.brush?.enabled || !entity.data) {
    return entity.data
  }

  const startIndex = entity.brush.startIndex ?? 0
  const endIndex = entity.brush.endIndex ?? entity.data.length - 1

  return entity.data.slice(startIndex, endIndex + 1)
}

/**
 * Helper to create scales based on chart type
 * Returns { xScale, yScale }
 */
export function createScales(entity, chartType) {
  // Use filtered data if brush is enabled
  const isZoomable = chartType === "line" || chartType === "area"
  const dataForScales = isZoomable ? entity.data : getFilteredData(entity)

  // Area charts use stacked scale only if entity.stacked is true
  // Default to false (non-stacked) for area charts
  const isStacked = chartType === "area" && entity.stacked === true
  const yScale = createYScale(
    dataForScales,
    entity.height,
    entity.padding,
    isStacked,
  )

  let xScale
  if (chartType === "bar") {
    const categories = dataForScales.map((d) => d.label || d.name || d.category)
    xScale = createOrdinalScale(categories, entity.width, entity.padding)
  } else {
    // Line chart or others that use linear/time scale
    xScale =
      entity.xAxisType === "time"
        ? createTimeScale(dataForScales, entity.width, entity.padding)
        : createXScale(dataForScales, entity.width, entity.padding)
  }

  return { xScale, yScale }
}

/**
 * @typedef {Object} CartesianContext
 * @property {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} xScale
 * @property {import('d3-scale').ScaleLinear} yScale
 * @property {Object} dimensions
 * @property {number} dimensions.width
 * @property {number} dimensions.height
 * @property {Object} dimensions.padding
 * @property {any} entity
 */

/**
 * Create cartesian context with scales, dimensions, and entity
 * @param {any} entity
 * @param {string} chartType
 * @returns {CartesianContext}
 */
export function createCartesianContext(entity, chartType) {
  const { xScale, yScale } = createScales(entity, chartType)

  return {
    xScale,
    yScale,
    dimensions: {
      width: entity.width,
      height: entity.height,
      padding: entity.padding,
    },
    entity,
  }
}

/**
 * Calculate X-axis ticks based on data
 * For few data points (≤15), shows all actual x values
 * For many data points, uses scale ticks
 *
 * @param {any[]} data - Chart data
 * @param {import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} xScale - X scale
 * @returns {number[]|Date[]} Array of tick values
 */
export function calculateXTicks(data, xScale) {
  if (!data || data.length === 0) {
    return xScale.ticks ? xScale.ticks(5) : xScale.domain()
  }

  // Extract all unique x values from data using Set for O(n) performance
  // This avoids O(n²) complexity from includes() in a loop
  const uniqueXValues = new Set()
  if (isMultiSeries(data)) {
    // Multi-series: extract from values arrays
    data.forEach((series) => {
      if (series.values) {
        series.values.forEach((v) => {
          const xVal = v.x ?? v.date
          if (xVal != null) {
            uniqueXValues.add(xVal)
          }
        })
      }
    })
  } else {
    // Single series: extract directly
    // Use index as fallback when x/date is not present (for categorical data)
    data.forEach((d, i) => {
      const xVal = getDataPointX(d, i)
      if (xVal != null) {
        uniqueXValues.add(xVal)
      }
    })
  }

  // Convert Set to sorted array
  const allXValues = Array.from(uniqueXValues).sort((a, b) => a - b)

  // If we have few data points (≤15), show all actual x values
  // Otherwise use D3's automatic tick calculation (like Recharts)
  if (xScale.ticks && allXValues.length <= 15) {
    return allXValues
  }
  if (xScale.ticks) {
    // Let D3 automatically choose optimal ticks (default behavior, like Recharts)
    // D3 will choose nice intervals automatically based on the scale
    return xScale.ticks()
  }
  return xScale.domain()
}

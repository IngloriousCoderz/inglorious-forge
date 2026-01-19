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
  const [minVal, maxVal] = extent(values)
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
 * Helper to create scales based on chart type
 * Returns { xScale, yScale }
 */
export function createScales(entity, chartType) {
  // Area charts use stacked scale only if entity.stacked is true
  // Default to false (non-stacked) for area charts
  const isStacked = chartType === "area" && entity.stacked === true
  const yScale = createYScale(
    entity.data,
    entity.height,
    entity.padding,
    isStacked,
  )

  let xScale
  if (chartType === "bar") {
    const categories = entity.data.map((d) => d.label || d.name || d.category)
    xScale = createOrdinalScale(categories, entity.width, entity.padding)
  } else {
    // Line chart or others that use linear/time scale
    xScale =
      entity.xAxisType === "time"
        ? createTimeScale(entity.data, entity.width, entity.padding)
        : createXScale(entity.data, entity.width, entity.padding)
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

  // Extract all unique x values from data
  const allXValues = []
  if (isMultiSeries(data)) {
    // Multi-series: extract from values arrays
    data.forEach((series) => {
      if (series.values) {
        series.values.forEach((v) => {
          const xVal = v.x ?? v.date
          if (xVal != null && !allXValues.includes(xVal)) {
            allXValues.push(xVal)
          }
        })
      }
    })
  } else {
    // Single series: extract directly
    data.forEach((d) => {
      const xVal = getDataPointX(d, null)
      if (xVal != null && !allXValues.includes(xVal)) {
        allXValues.push(xVal)
      }
    })
  }

  // Sort values
  allXValues.sort((a, b) => a - b)

  // If we have few data points (≤15), show all actual x values
  // Otherwise use ticks
  if (xScale.ticks && allXValues.length <= 15) {
    return allXValues
  }
  if (xScale.ticks) {
    return xScale.ticks(Math.min(10, data.length))
  }
  return xScale.domain()
}

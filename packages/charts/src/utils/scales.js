/* eslint-disable no-magic-numbers */

import { extent } from "d3-array"
import { scaleBand, scaleLinear, scaleTime } from "d3-scale"

export function createYScale(data, height, padding, isStacked = false) {
  const isMultiSeries = Array.isArray(data[0]?.values)

  let values
  if (isMultiSeries) {
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
    values = data.map((d) => d.y ?? d.value ?? 0)
  }

  const [minVal, maxVal] = extent(values)
  // Always start at 0 to avoid visual distortions
  const min = Math.min(0, minVal ?? 0)
  const max = maxVal ?? 100
  return scaleLinear()
    .domain([min, max])
    .range([height - padding.bottom, padding.top])
}

export function createXScale(data, width, padding) {
  // Handle multi-series data (array of series with values)
  const isMultiSeries = Array.isArray(data[0]?.values)
  let values
  if (isMultiSeries) {
    // Extract all x values from all series
    values = data.flatMap((series) =>
      series.values ? series.values.map((v) => v.x ?? v.date) : [],
    )
  } else {
    // Single series: extract directly
    values = data.map((d, i) => d.x ?? d.date ?? i)
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
 * Helper para criar escalas baseado no tipo de chart
 * Retorna { xScale, yScale }
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
    // line chart ou outros que usam escala linear/time
    xScale =
      entity.xAxisType === "time"
        ? createTimeScale(entity.data, entity.width, entity.padding)
        : createXScale(entity.data, entity.width, entity.padding)
  }

  return { xScale, yScale }
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

  const isMultiSeries = Array.isArray(data[0]?.values)

  // Extract all unique x values from data
  const allXValues = []
  if (isMultiSeries) {
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
      const xVal = d.x ?? d.date
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

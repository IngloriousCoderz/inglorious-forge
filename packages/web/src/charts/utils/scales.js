/* eslint-disable no-magic-numbers */

import { extent } from "d3-array"
import { scaleBand, scaleLinear, scaleTime } from "d3-scale"

export function createYScale(data, height, padding) {
  const values = data.flatMap((d) =>
    Array.isArray(d.values)
      ? d.values.map((v) => v.y ?? v.value ?? v)
      : [d.y ?? d.value ?? 0],
  )
  const [minVal, maxVal] = extent(values)
  return scaleLinear()
    .domain([minVal ?? 0, maxVal ?? 100])
    .range([height - padding.bottom, padding.top])
}

export function createXScale(data, width, padding) {
  const values = data.map((d, i) => d.x ?? i)
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
  const yScale = createYScale(entity.data, entity.height, entity.padding)

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

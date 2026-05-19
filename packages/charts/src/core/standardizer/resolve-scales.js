/* eslint-disable no-magic-numbers */

import { max, min, sum } from "d3-array"
import { scaleBand, scaleLinear, scalePoint } from "d3-scale"

export function createScales(entity, primitives, dimensions) {
  if (entity.type === "pie" || entity.type === "donut") {
    const piePrimitive = getPolarPrimitive(primitives)
    const polarProps = piePrimitive?.props || {}

    return {
      centerX: resolveRadiusValue(
        polarProps.cx ?? entity.cx ?? "50%",
        dimensions.width,
      ),
      centerY: resolveRadiusValue(
        polarProps.cy ?? entity.cy ?? "50%",
        dimensions.height,
      ),
      outerRadius: resolveRadiusValue(
        polarProps.outerRadius ?? entity.outerRadius ?? "70%",
        Math.min(dimensions.width, dimensions.height) / 2,
      ),
      innerRadius: resolveRadiusValue(
        polarProps.innerRadius ?? entity.innerRadius ?? 0,
        Math.min(dimensions.width, dimensions.height) / 2,
      ),
    }
  }

  const rows = entity.data
  const xDomain = rows.map((row, index) => `${row?.[entity.xKey] ?? index}`)
  const hasBars = primitives.some((primitive) => primitive.type === "bar")
  const xScale = hasBars
    ? scaleBand()
        .domain(xDomain)
        .range([dimensions.plotLeft, dimensions.plotRight])
        .padding(0.18)
    : scalePoint()
        .domain(xDomain)
        .range([dimensions.plotLeft, dimensions.plotRight])
        .padding(0)

  const plottedKeys = getPlottedKeys(entity, primitives)
  const domain = getYDomain(entity.fullData, plottedKeys, primitives)
  const yScale = scaleLinear()
    .domain(domain)
    .nice()
    .range([dimensions.plotBottom, dimensions.plotTop])

  return {
    xScale,
    xScaleMode: hasBars ? "band" : "point",
    yScale,
    plottedKeys,
  }
}

function getPlottedKeys(entity, primitives) {
  const plotted = primitives
    .filter((primitive) => ["line", "area", "bar"].includes(primitive.type))
    .map((primitive) => primitive.props?.dataKey)
    .filter(Boolean)

  return plotted.length > 0 ? plotted : entity.seriesKeys
}

function getYDomain(rows, plottedKeys, primitives) {
  if (!Array.isArray(rows) || rows.length === 0) return [0, 1]

  const stackGroups = collectAreaStackGroups(primitives)
  const values = []

  rows.forEach((row) => {
    plottedKeys.forEach((key) => {
      values.push(Number.isFinite(row?.[key]) ? row[key] : 0)
    })

    stackGroups.forEach((keys) => {
      values.push(
        sum(keys, (key) => (Number.isFinite(row?.[key]) ? row[key] : 0)),
      )
    })
  })

  const minValue = min(values) ?? 0
  const maxValue = max(values) ?? 1
  const lowerBound = Math.min(0, minValue)
  const upperBound = maxValue === lowerBound ? lowerBound + 1 : maxValue

  return [lowerBound, upperBound]
}

function collectAreaStackGroups(primitives) {
  const groups = new Map()

  primitives.forEach((primitive) => {
    if (primitive.type !== "area") return
    const stackId = primitive.props?.stackId
    const dataKey = primitive.props?.dataKey
    if (!stackId || !dataKey) return

    const keys = groups.get(stackId) || []
    keys.push(dataKey)
    groups.set(stackId, keys)
  })

  return [...groups.values()]
}

function getPolarPrimitive(primitives) {
  return primitives.find((primitive) => primitive.type === "pie")
}

function resolveRadiusValue(value, base) {
  if (typeof value === "string" && value.endsWith("%")) {
    return (Number.parseFloat(value) / 100) * base
  }

  return Number.isFinite(value) ? value : base
}

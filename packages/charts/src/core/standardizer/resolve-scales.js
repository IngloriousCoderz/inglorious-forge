/* eslint-disable no-magic-numbers */

import { max, min, sum } from "d3-array"
import { scaleBand, scaleLinear, scalePoint } from "d3-scale"

export function createScales(entity, components, dimensions) {
  if (entity.type === "pie" || entity.type === "donut") {
    const pieComponent = getPolarComponent(components)
    const polarProps = pieComponent?.props || {}

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
  const hasBars = components.some((component) => component.type === "bar")
  const xScale = hasBars
    ? scaleBand()
        .domain(xDomain)
        .range([dimensions.plotLeft, dimensions.plotRight])
        .padding(0.18)
    : scalePoint()
        .domain(xDomain)
        .range([dimensions.plotLeft, dimensions.plotRight])
        .padding(0)

  const plottedKeys = getPlottedKeys(entity, components)
  const domain = getYDomain(entity.fullData, plottedKeys, components)
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

function getPlottedKeys(entity, components) {
  const plotted = components
    .filter((component) => ["line", "area", "bar"].includes(component.type))
    .map((component) => component.props?.dataKey)
    .filter(Boolean)

  return plotted.length > 0 ? plotted : entity.seriesKeys
}

function getYDomain(rows, plottedKeys, components) {
  if (!Array.isArray(rows) || rows.length === 0) return [0, 1]

  const stackGroups = collectAreaStackGroups(components)
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

function collectAreaStackGroups(components) {
  const groups = new Map()

  components.forEach((component) => {
    if (component.type !== "area") return
    const stackId = component.props?.stackId
    const dataKey = component.props?.dataKey
    if (!stackId || !dataKey) return

    const keys = groups.get(stackId) || []
    keys.push(dataKey)
    groups.set(stackId, keys)
  })

  return [...groups.values()]
}

function getPolarComponent(components) {
  return components.find((component) => component.type === "pie")
}

function resolveRadiusValue(value, base) {
  if (typeof value === "string" && value.endsWith("%")) {
    return (Number.parseFloat(value) / 100) * base
  }

  return Number.isFinite(value) ? value : base
}

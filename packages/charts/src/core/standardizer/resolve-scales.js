/* eslint-disable no-magic-numbers */

import { extent, max, min, sum } from "d3-array"
import { scaleBand, scaleLinear, scalePoint, scaleSqrt } from "d3-scale"

import { CHAR_WIDTH } from "../defaults.js"

/** The radius of a scatter point without a size, and the range of sized ones. */
const POINT_RADIUS = 5
const SIZED_POINT_RADII = [3, 16]
/** How far past its outermost points a scatter chart's axes reach. */
const SCATTER_MARGIN = 0.05
/** The space between a radar chart and its categories' names. */
const RADAR_LABEL_GAP = 16

export function createScales(entity, primitives, dimensions) {
  if (["pie", "donut", "radial"].includes(entity.type)) {
    const piePrimitive = getPolarPrimitive(primitives)
    const polarProps = piePrimitive?.props || {}
    // The pie fits in the room under its legend, if it has one.
    const top = dimensions.legendHeight ? dimensions.plotTop : 0
    const height = dimensions.height - top
    const radiusBase = Math.min(dimensions.width, height) / 2

    return {
      centerX: resolveRadiusValue(
        polarProps.cx ?? entity.cx ?? "50%",
        dimensions.width,
      ),
      centerY:
        top + resolveRadiusValue(polarProps.cy ?? entity.cy ?? "50%", height),
      outerRadius: resolveRadiusValue(
        polarProps.outerRadius ?? entity.outerRadius ?? "70%",
        radiusBase,
      ),
      innerRadius: resolveRadiusValue(
        polarProps.innerRadius ?? entity.innerRadius ?? 0,
        radiusBase,
      ),
    }
  }

  if (entity.type === "scatter") return createScatterScales(entity, dimensions)
  if (entity.type === "radar") {
    return createRadarScales(entity, primitives, dimensions)
  }

  const rows = entity.data
  // `xScale` places the categories and `yScale` the values. Horizontal bars
  // turn them: categories run down the left, values along the bottom.
  const isHorizontal = entity.orientation === "horizontal"
  const categoryRange = isHorizontal
    ? [dimensions.plotTop, dimensions.plotBottom]
    : [dimensions.plotLeft, dimensions.plotRight]
  const valueRange = isHorizontal
    ? [dimensions.plotLeft, dimensions.plotRight]
    : [dimensions.plotBottom, dimensions.plotTop]
  // Positions go by row, not by label: two rows may share a label.
  const xDomain = rows.map((row, index) => index)
  const hasBars = primitives.some((primitive) => primitive.type === "bar")
  const xScale = hasBars
    ? scaleBand().domain(xDomain).range(categoryRange).padding(0.18)
    : scalePoint().domain(xDomain).range(categoryRange).padding(0)

  const plottedKeys = getPlottedKeys(entity, primitives)
  const domain = getYDomain(entity.fullData, plottedKeys, primitives)
  const yScale = scaleLinear().domain(domain).nice().range(valueRange)

  return {
    xScale,
    xScaleMode: hasBars ? "band" : "point",
    yScale,
    plottedKeys,
    isHorizontal,
  }
}

function getPlottedKeys(entity, primitives) {
  const plotted = primitives
    .filter((primitive) =>
      ["line", "area", "bar", "radar"].includes(primitive.type),
    )
    .map((primitive) => primitive.props?.dataKey)
    .filter(Boolean)

  return plotted.length > 0 ? plotted : entity.seriesKeys
}

function getYDomain(rows, plottedKeys, primitives) {
  if (!Array.isArray(rows) || rows.length === 0) return [0, 1]

  const stackGroups = collectStackGroups(primitives)
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

// Areas and bars stack, each with others of their kind sharing a `stackId`:
// the axis has to reach the top of the tallest stack.
function collectStackGroups(primitives) {
  const groups = new Map()

  primitives.forEach((primitive) => {
    if (primitive.type !== "area" && primitive.type !== "bar") return
    const stackId = primitive.props?.stackId
    const dataKey = primitive.props?.dataKey
    if (!stackId || !dataKey) return

    const group = `${primitive.type}:${stackId}`
    const keys = groups.get(group) || []
    keys.push(dataKey)
    groups.set(group, keys)
  })

  return [...groups.values()]
}

function getPolarPrimitive(primitives) {
  return primitives.find((primitive) =>
    ["pie", "radial-bar"].includes(primitive.type),
  )
}

function resolveRadiusValue(value, base) {
  if (typeof value === "string" && value.endsWith("%")) {
    return (Number.parseFloat(value) / 100) * base
  }

  return Number.isFinite(value) ? value : base
}

// Both axes of a scatter chart are numbers, around the points rather than
// from zero; a point's `z`, when the points have one, sets its size.
function createScatterScales(entity, dimensions) {
  const points = entity.data.flatMap(({ points }) => points)
  const sizes = points.map(({ z }) => z).filter(Number.isFinite)
  const size = scaleSqrt()
    .domain([0, max(sizes) ?? 1])
    .range(SIZED_POINT_RADII)

  return {
    xScale: scaleLinear()
      .domain(spread(extent(points, ({ x }) => x)))
      .nice()
      .range([dimensions.plotLeft, dimensions.plotRight]),
    xScaleMode: "linear",
    yScale: scaleLinear()
      .domain(spread(extent(points, ({ y }) => y)))
      .nice()
      .range([dimensions.plotBottom, dimensions.plotTop]),
    // A point without a size, or a chart whose points have none, gets the
    // default radius.
    zScale: (z) =>
      sizes.length && Number.isFinite(z) ? size(z) : POINT_RADIUS,
    plottedKeys: entity.seriesKeys,
  }
}

// A domain needs two ends: no points, or all at one value, still make one.
// It reaches a little past the outermost points, so none sits on an edge.
function spread([low, high]) {
  if (low === undefined) return [0, 1]
  if (low === high) return [low - 1, high + 1]
  const margin = (high - low) * SCATTER_MARGIN
  return [low - margin, high + margin]
}

// A radar chart is round, in the middle of the room below its legend, and
// leaves space around it for the categories' names.
function createRadarScales(entity, primitives, dimensions) {
  const plottedKeys = getPlottedKeys(entity, primitives)
  const values = entity.data.flatMap((row) =>
    plottedKeys.map((key) => (Number.isFinite(row?.[key]) ? row[key] : 0)),
  )
  const labelRoom =
    Math.max(
      0,
      ...entity.data.map((row) => String(row?.[entity.xKey] ?? "").length),
    ) *
      CHAR_WIDTH +
    RADAR_LABEL_GAP
  const radius = Math.max(
    0,
    Math.min(
      dimensions.width / 2 - labelRoom,
      dimensions.plotHeight / 2 - RADAR_LABEL_GAP,
    ),
  )

  return {
    centerX: dimensions.width / 2,
    centerY: dimensions.plotTop + dimensions.plotHeight / 2,
    radiusScale: scaleLinear()
      .domain([0, max(values) || 1])
      .nice()
      .range([0, radius]),
    plottedKeys,
  }
}

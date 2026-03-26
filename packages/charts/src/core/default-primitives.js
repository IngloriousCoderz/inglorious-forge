/* eslint-disable no-magic-numbers */

import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  Legend,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "../primitives/factories.js"

export const DEFAULT_PRIMITIVES = {
  line: buildDefaultLinePrimitives,
  area: buildDefaultAreaPrimitives,
  bar: buildDefaultBarPrimitives,
  pie: buildDefaultPiePrimitives,
  donut: buildDefaultDonutPrimitives,
  composed: buildDefaultComposedPrimitives,
}

const CARTESIAN_PRIMITIVES = {
  area: Area,
  bar: Bar,
  line: Line,
}

function buildDefaultLinePrimitives(entity) {
  const primitives = buildCartesianScaffold(entity)

  entity.seriesKeys.forEach((dataKey, index) => {
    primitives.push(
      Line({ dataKey, stroke: entity.colors[index], hasDots: true }),
    )
  })

  return addSharedCartesianOverlays(primitives, entity)
}

function buildDefaultAreaPrimitives(entity) {
  const primitives = buildCartesianScaffold(entity)

  entity.seriesKeys.forEach((dataKey, index) => {
    primitives.push(
      Area({
        dataKey,
        stroke: entity.colors[index],
        fill: entity.colors[index],
        fillOpacity: entity.stacked ? 0.45 : 0.3,
        stackId: entity.stacked ? "default-stack" : undefined,
      }),
    )
  })

  return addSharedCartesianOverlays(primitives, entity)
}

function buildDefaultBarPrimitives(entity) {
  const primitives = buildCartesianScaffold(entity)

  entity.seriesKeys.forEach((dataKey, index) => {
    primitives.push(Bar({ dataKey, fill: entity.colors[index] }))
  })

  return addSharedCartesianOverlays(primitives, entity)
}

function buildDefaultPiePrimitives(entity) {
  const nameKey = entity.nameKey || "label"
  const dataKey = entity.dataKey || "value"
  const primitives = [
    Pie({
      dataKey,
      nameKey,
      cx: entity.cx || "50%",
      cy: entity.cy || "50%",
      outerRadius: entity.outerRadius || "70%",
      hasLabel: entity.hasLabel !== false,
    }),
  ]

  if (entity.hasTooltip === true) {
    primitives.push(Tooltip({}))
  }

  return primitives
}

function buildDefaultDonutPrimitives(entity) {
  const [piePrimitive] = buildDefaultPiePrimitives({
    ...entity,
    innerRadius: entity.innerRadius || "55%",
  })
  const primitives = [
    Pie({
      ...piePrimitive.props,
      innerRadius: entity.innerRadius || "55%",
    }),
  ]

  if (entity.hasTooltip === true) {
    primitives.push(Tooltip({}))
  }

  return primitives
}

function buildDefaultComposedPrimitives(entity) {
  const primitives = buildCartesianScaffold(entity)
  const series = Array.isArray(entity.series) ? entity.series : []

  series.forEach((item, index) => {
    if (!item || typeof item !== "object") return
    const Primitive = CARTESIAN_PRIMITIVES[item.kind]
    if (!Primitive) return
    const color = entity.colors[index]

    primitives.push(
      Primitive({
        stroke: color,
        fill: color,
        fillOpacity: 0.3,
        ...item,
      }),
    )
  })

  return addSharedCartesianOverlays(primitives, entity)
}

function addSharedCartesianOverlays(primitives, entity) {
  const overlays = [
    entity.hasLegend !== false && entity.seriesKeys.length > 1 && Legend({}),
    entity.hasTooltip === true && Tooltip({}),
    shouldShowBrush(entity) && Brush({ height: entity.brush.height || 30 }),
  ].filter(Boolean)

  primitives.push(...overlays)

  return primitives
}

function buildCartesianScaffold(entity) {
  const primitives = []

  if (entity.hasGrid !== false) {
    primitives.push(CartesianGrid())
  }

  primitives.push(XAxis({ dataKey: entity.xKey }))
  primitives.push(YAxis())

  return primitives
}

function shouldShowBrush(entity) {
  return entity.brush?.enabled && entity.brush?.visible !== false
}

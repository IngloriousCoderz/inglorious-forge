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
} from "../components/factories.js"

export const DEFAULT_COMPONENTS = {
  line: buildDefaultLineComponents,
  area: buildDefaultAreaComponents,
  bar: buildDefaultBarComponents,
  pie: buildDefaultPieComponents,
  donut: buildDefaultDonutComponents,
  composed: buildDefaultComposedComponents,
}

const CARTESIAN_COMPONENTS = {
  area: Area,
  bar: Bar,
  line: Line,
}

function buildDefaultLineComponents(entity) {
  const components = buildCartesianScaffold(entity)

  entity.seriesKeys.forEach((dataKey, index) => {
    components.push(
      Line({ dataKey, stroke: entity.colors[index], showDots: true }),
    )
  })

  return addSharedCartesianOverlays(components, entity)
}

function buildDefaultAreaComponents(entity) {
  const components = buildCartesianScaffold(entity)

  entity.seriesKeys.forEach((dataKey, index) => {
    components.push(
      Area({
        dataKey,
        stroke: entity.colors[index],
        fill: entity.colors[index],
        fillOpacity: entity.stacked ? 0.45 : 0.3,
        stackId: entity.stacked ? "default-stack" : undefined,
      }),
    )
  })

  return addSharedCartesianOverlays(components, entity)
}

function buildDefaultBarComponents(entity) {
  const components = buildCartesianScaffold(entity)

  entity.seriesKeys.forEach((dataKey, index) => {
    components.push(Bar({ dataKey, fill: entity.colors[index] }))
  })

  return addSharedCartesianOverlays(components, entity)
}

function buildDefaultPieComponents(entity) {
  const nameKey = entity.nameKey || "label"
  const dataKey = entity.dataKey || "value"
  const components = [
    Pie({
      dataKey,
      nameKey,
      cx: entity.cx || "50%",
      cy: entity.cy || "50%",
      outerRadius: entity.outerRadius || "70%",
      label: entity.showLabel !== false,
    }),
  ]

  if (entity.showTooltip === true) {
    components.push(Tooltip({}))
  }

  return components
}

function buildDefaultDonutComponents(entity) {
  const [pieComponent] = buildDefaultPieComponents({
    ...entity,
    innerRadius: entity.innerRadius || "55%",
  })
  const components = [
    Pie({
      ...pieComponent.props,
      innerRadius: entity.innerRadius || "55%",
    }),
  ]

  if (entity.showTooltip === true) {
    components.push(Tooltip({}))
  }

  return components
}

function buildDefaultComposedComponents(entity) {
  const components = buildCartesianScaffold(entity)
  const series = Array.isArray(entity.series) ? entity.series : []

  series.forEach((item, index) => {
    if (!item || typeof item !== "object") return
    const Component = CARTESIAN_COMPONENTS[item.kind]
    if (!Component) return
    const color = entity.colors[index]

    components.push(
      Component({
        stroke: color,
        fill: color,
        fillOpacity: 0.3,
        ...item,
      }),
    )
  })

  return addSharedCartesianOverlays(components, entity)
}

function addSharedCartesianOverlays(components, entity) {
  const overlays = [
    entity.showLegend !== false && entity.seriesKeys.length > 1 && Legend({}),
    entity.showTooltip === true && Tooltip({}),
    shouldShowBrush(entity) && Brush({ height: entity.brush.height || 30 }),
  ].filter(Boolean)

  components.push(...overlays)

  return components
}

function buildCartesianScaffold(entity) {
  const components = []

  if (entity.showGrid !== false) {
    components.push(CartesianGrid())
  }

  components.push(XAxis({ dataKey: entity.xKey }))
  components.push(YAxis())

  return components
}

function shouldShowBrush(entity) {
  return entity.brush?.enabled && entity.brush?.visible !== false
}

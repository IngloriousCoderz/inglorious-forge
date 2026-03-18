/* eslint-disable no-magic-numbers */

import { max, min, sum } from "d3-array"
import { scaleBand, scaleLinear } from "d3-scale"

import {
  CHART_TYPES,
  COMPONENT_TYPES,
  DEFAULT_BAR_PADDING,
  DEFAULT_BRUSH_GAP,
  DEFAULT_BRUSH_HEIGHT,
  DEFAULT_HEIGHT,
  DEFAULT_LEGEND_HEIGHT,
  DEFAULT_LINE_PADDING,
  DEFAULT_WIDTH,
  NON_SERIES_KEYS,
  PALETTE,
  SERIES_COMPONENTS,
  X_VALUE_KEYS,
} from "./constants.js"
import { DEFAULT_COMPONENTS } from "./default-components.js"

const INLINE_PREFIX = "inline-chart"

export function standardizeStoreEntity(entity) {
  return buildFrame(entity, {})
}

export function standardizeRenderInput(source, config = {}) {
  return buildFrame(source, config)
}

function buildFrame(source, config) {
  const sourceObject = isObject(source) ? source : {}
  const configObject = isObject(config) ? config : {}
  const explicitComponents = normalizeChildren(
    configObject.children ?? sourceObject.children,
  )
  const requestedKeys = collectRequestedDataKeys(
    explicitComponents,
    configObject.dataKeys ?? sourceObject.dataKeys,
  )
  const entityDraft = mergeEntityDraft(sourceObject, configObject)
  const chartType = resolveChartType(entityDraft, explicitComponents)
  const normalizedEntity = normalizeEntity(
    {
      ...entityDraft,
      id: entityDraft.id || buildStableId(entityDraft, chartType),
      type: chartType,
    },
    requestedKeys,
  )
  const components =
    explicitComponents.length > 0
      ? explicitComponents
      : DEFAULT_COMPONENTS[chartType]?.(normalizedEntity) || []
  const tooltipEnabled = resolveTooltipEnabled(normalizedEntity, components)
  const filteredEntity = applyBrushWindow(
    normalizedEntity,
    components,
    tooltipEnabled,
  )
  const dimensions = resolveDimensions(filteredEntity, components)
  const scales = createScales(filteredEntity, components, dimensions)

  return {
    entity: filteredEntity,
    components,
    scales,
    dimensions,
  }
}

function mergeEntityDraft(source, config) {
  return {
    ...source,
    ...config,
    children: undefined,
    data: config.data ?? source.data ?? [],
    series: config.series ?? source.series,
    brush: config.brush ?? source.brush,
    width: config.width ?? source.width ?? DEFAULT_WIDTH,
    height: config.height ?? source.height ?? DEFAULT_HEIGHT,
    showGrid: config.showGrid ?? source.showGrid,
    showLegend: config.showLegend ?? source.showLegend,
    showTooltip: config.showTooltip ?? source.showTooltip,
    padding: config.padding ?? source.padding,
    centerText: config.centerText ?? source.centerText,
    stacked: config.stacked ?? source.stacked,
    colors: config.colors ?? source.colors,
    dataKeys: config.dataKeys ?? source.dataKeys,
  }
}

function resolveChartType(entity, components) {
  if (entity.type === CHART_TYPES.DONUT) return CHART_TYPES.DONUT
  if (entity.type === CHART_TYPES.PIE) return CHART_TYPES.PIE
  if (entity.type === CHART_TYPES.LINE) return CHART_TYPES.LINE
  if (entity.type === CHART_TYPES.AREA) return CHART_TYPES.AREA
  if (entity.type === CHART_TYPES.BAR) return CHART_TYPES.BAR
  if (entity.type === CHART_TYPES.COMPOSED) return CHART_TYPES.COMPOSED

  if (components.some((component) => component.type === COMPONENT_TYPES.PIE)) {
    return entity.centerText ? CHART_TYPES.DONUT : CHART_TYPES.PIE
  }

  const hasArea = components.some(
    (component) => component.type === COMPONENT_TYPES.AREA,
  )
  const hasBar = components.some(
    (component) => component.type === COMPONENT_TYPES.BAR,
  )
  const hasLine = components.some(
    (component) => component.type === COMPONENT_TYPES.LINE,
  )

  if ([hasArea, hasBar, hasLine].filter(Boolean).length > 1) {
    return CHART_TYPES.COMPOSED
  }

  if (hasArea) return CHART_TYPES.AREA
  if (hasBar) return CHART_TYPES.BAR
  if (hasLine) return CHART_TYPES.LINE

  return CHART_TYPES.LINE
}

function normalizeEntity(entity, requestedKeys) {
  const colors = resolveColors(entity.colors)

  if (entity.type === CHART_TYPES.PIE || entity.type === CHART_TYPES.DONUT) {
    const pieData = normalizePieData(entity.data)

    return {
      ...entity,
      colors,
      data: pieData,
      fullData: pieData,
      dataKey: entity.dataKey || "value",
      nameKey: entity.nameKey || "label",
      seriesKeys: [],
      xKey: null,
      padding: resolvePadding(entity.padding, entity.width, entity.height),
      tooltipEnabled: entity.showTooltip !== false,
    }
  }

  const normalizedCartesian = normalizeCartesianData(entity.data, requestedKeys)

  return {
    ...entity,
    colors,
    data: normalizedCartesian.rows,
    fullData: normalizedCartesian.rows,
    seriesKeys: normalizedCartesian.seriesKeys,
    xKey: normalizedCartesian.xKey,
    padding: resolvePadding(entity.padding, entity.width, entity.height),
    tooltipEnabled: entity.showTooltip !== false,
  }
}

function normalizePieData(rawData) {
  if (!Array.isArray(rawData)) return []

  return rawData.map((row, index) => ({
    label: row?.label ?? row?.name ?? `Slice ${index + 1}`,
    value: Number.isFinite(row?.value) ? row.value : 0,
    color: row?.color,
  }))
}

function normalizeCartesianData(rawData, requestedKeys) {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return {
      rows: [],
      xKey: "name",
      seriesKeys: requestedKeys,
    }
  }

  if (Array.isArray(rawData[0]?.values)) {
    return normalizeLongSeriesData(rawData)
  }

  if (hasPointShape(rawData)) {
    return normalizePointSeriesData(rawData)
  }

  return normalizeWideSeriesData(rawData, requestedKeys)
}

function normalizeLongSeriesData(seriesList) {
  const rowsByIndex = []
  const seriesKeys = []

  seriesList.forEach((series) => {
    const dataKey =
      series?.dataKey || series?.name || `series-${seriesKeys.length + 1}`
    seriesKeys.push(dataKey)

    series.values.forEach((point, index) => {
      rowsByIndex[index] ??= {}
      const row = rowsByIndex[index]
      row.name ??=
        point?.name ?? point?.label ?? point?.date ?? `${point?.x ?? index}`
      row.x ??= point?.x ?? index
      row.date ??= point?.date
      row[dataKey] = resolveNumericValue(point)
    })
  })

  return {
    rows: rowsByIndex,
    xKey: "name",
    seriesKeys,
  }
}

function normalizePointSeriesData(points) {
  const rows = points.map((point, index) => ({
    ...point,
    name: point?.name ?? point?.label ?? point?.date ?? `${point?.x ?? index}`,
    value: resolveNumericValue(point),
  }))

  return {
    rows,
    xKey: "name",
    seriesKeys: ["value"],
  }
}

function normalizeWideSeriesData(rows, requestedKeys) {
  const xKey = resolveXKey(rows)
  const seriesKeys =
    requestedKeys.length > 0 ? requestedKeys : inferSeriesKeys(rows, xKey)
  const normalizedRows = rows.map((row, index) => ({
    ...row,
    [xKey]: row?.[xKey] ?? row?.name ?? row?.label ?? row?.date ?? `${index}`,
  }))

  return {
    rows: normalizedRows,
    xKey,
    seriesKeys,
  }
}

function resolveXKey(rows) {
  const firstRow = rows[0] || {}

  for (const key of X_VALUE_KEYS) {
    if (firstRow[key] != null) return key
  }

  return "name"
}

function inferSeriesKeys(rows, xKey) {
  const keys = new Set()

  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      if (key === xKey || NON_SERIES_KEYS.has(key)) return
      if (Number.isFinite(row[key])) keys.add(key)
    })
  })

  if (keys.size > 0) return [...keys]
  return ["value"]
}

function collectRequestedDataKeys(components, configDataKeys) {
  const keys = new Set(Array.isArray(configDataKeys) ? configDataKeys : [])

  components.forEach((component) => {
    const dataKey = component?.props?.dataKey
    if (dataKey) keys.add(dataKey)
  })

  return [...keys]
}

function normalizeChildren(children) {
  if (!children) return []
  return Array.isArray(children) ? children.filter(Boolean) : [children]
}

function resolveTooltipEnabled(entity, components) {
  if (entity.showTooltip === true) return true
  if (entity.showTooltip === false) {
    return components.some(
      (component) => component.type === COMPONENT_TYPES.TOOLTIP,
    )
  }

  if (
    components.some((component) => component.type === COMPONENT_TYPES.TOOLTIP)
  ) {
    return true
  }

  return components.some((component) => component.props?.showTooltip === true)
}

function applyBrushWindow(entity, components, tooltipEnabled) {
  const hasBrushComponent = components.some(
    (component) => component.type === COMPONENT_TYPES.BRUSH,
  )
  const brushEnabled = entity.brush?.enabled || hasBrushComponent
  const fullData = Array.isArray(entity.fullData)
    ? entity.fullData
    : entity.data

  if (!brushEnabled || !Array.isArray(fullData)) {
    return {
      ...entity,
      brush: brushEnabled
        ? {
            enabled: true,
            height: entity.brush?.height || DEFAULT_BRUSH_HEIGHT,
            startIndex: 0,
            endIndex: Math.max(0, fullData.length - 1),
            visible: entity.brush?.visible ?? true,
          }
        : entity.brush,
      tooltipEnabled,
      data: fullData,
      fullData,
    }
  }

  const startIndex = clampIndex(entity.brush?.startIndex ?? 0, fullData.length)
  const endIndex = clampIndex(
    entity.brush?.endIndex ?? Math.max(0, fullData.length - 1),
    fullData.length,
  )
  const boundedStart = Math.min(startIndex, endIndex)
  const boundedEnd = Math.max(startIndex, endIndex)

  return {
    ...entity,
    brush: {
      enabled: true,
      height: entity.brush?.height || DEFAULT_BRUSH_HEIGHT,
      startIndex: boundedStart,
      endIndex: boundedEnd,
      visible: entity.brush?.visible ?? true,
    },
    tooltipEnabled,
    data: fullData.slice(boundedStart, boundedEnd + 1),
    fullData,
  }
}

function resolveDimensions(entity, components) {
  const width = entity.width || DEFAULT_WIDTH
  const height = entity.height || DEFAULT_HEIGHT
  const hasLegend = components.some(
    (component) => component.type === COMPONENT_TYPES.LEGEND,
  )
  const brushComponent = components.find(
    (component) => component.type === COMPONENT_TYPES.BRUSH,
  )
  const brushHeight =
    entity.brush?.enabled || brushComponent
      ? brushComponent?.props?.height ||
        entity.brush?.height ||
        DEFAULT_BRUSH_HEIGHT
      : 0
  const legendHeight = hasLegend ? DEFAULT_LEGEND_HEIGHT : 0
  const plotTop = entity.padding.top + legendHeight
  const plotBottom =
    height -
    entity.padding.bottom -
    (brushHeight > 0 ? brushHeight + DEFAULT_BRUSH_GAP : 0)
  const plotLeft = entity.padding.left
  const plotRight = width - entity.padding.right

  return {
    width,
    height,
    padding: entity.padding,
    plotTop,
    plotRight,
    plotBottom,
    plotLeft,
    plotWidth: Math.max(0, plotRight - plotLeft),
    plotHeight: Math.max(0, plotBottom - plotTop),
    legendHeight,
    brushHeight,
    brushTop:
      brushHeight > 0 ? height - entity.padding.bottom - brushHeight : null,
  }
}

function createScales(entity, components, dimensions) {
  if (entity.type === CHART_TYPES.PIE || entity.type === CHART_TYPES.DONUT) {
    return {
      centerX: resolveRadiusValue(entity.cx || "50%", dimensions.width),
      centerY: resolveRadiusValue(entity.cy || "50%", dimensions.height),
      outerRadius: resolveRadiusValue(
        entity.outerRadius || "70%",
        Math.min(dimensions.width, dimensions.height) / 2,
      ),
      innerRadius: resolveRadiusValue(
        entity.innerRadius || 0,
        Math.min(dimensions.width, dimensions.height) / 2,
      ),
    }
  }

  const rows = entity.data
  const xDomain = rows.map((row, index) => `${row?.[entity.xKey] ?? index}`)
  const hasBars = components.some(
    (component) => component.type === COMPONENT_TYPES.BAR,
  )
  const xScale = scaleBand()
    .domain(xDomain)
    .range([dimensions.plotLeft, dimensions.plotRight])
    .padding(hasBars ? DEFAULT_BAR_PADDING : DEFAULT_LINE_PADDING)

  const plottedKeys = resolvePlottedKeys(entity, components)
  const domain = resolveYDomain(entity.fullData, plottedKeys, components)
  const yScale = scaleLinear()
    .domain(domain)
    .nice()
    .range([dimensions.plotBottom, dimensions.plotTop])

  return {
    xScale,
    yScale,
    plottedKeys,
  }
}

function resolvePlottedKeys(entity, components) {
  const plotted = components
    .filter((component) => SERIES_COMPONENTS.includes(component.type))
    .map((component) => component.props?.dataKey)
    .filter(Boolean)

  if (plotted.length > 0) return plotted
  return entity.seriesKeys
}

function resolveYDomain(rows, plottedKeys, components) {
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
    if (component.type !== COMPONENT_TYPES.AREA) return
    const stackId = component.props?.stackId
    const dataKey = component.props?.dataKey
    if (!stackId || !dataKey) return

    const keys = groups.get(stackId) || []
    keys.push(dataKey)
    groups.set(stackId, keys)
  })

  return [...groups.values()]
}

function resolveColors(colors) {
  if (Array.isArray(colors) && colors.length > 0) return colors
  return [...PALETTE]
}

function resolvePadding(padding, width, height) {
  const base = {
    top: Math.max(20, height * 0.05),
    right: Math.max(20, width * 0.05),
    bottom: Math.max(40, height * 0.1),
    left: Math.max(50, width * 0.1),
  }

  if (padding == null) return base

  if (typeof padding === "number") {
    return {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding,
    }
  }

  return {
    top: padding.top ?? base.top,
    right: padding.right ?? base.right,
    bottom: padding.bottom ?? base.bottom,
    left: padding.left ?? base.left,
  }
}

function resolveNumericValue(point) {
  if (Number.isFinite(point?.value)) return point.value
  if (Number.isFinite(point?.y)) return point.y
  return 0
}

function hasPointShape(data) {
  const firstPoint = data[0] || {}
  return firstPoint.y != null || firstPoint.value != null
}

function isObject(value) {
  return value != null && typeof value === "object"
}

function buildStableId(entity, chartType) {
  const base =
    entity.key || entity.id || entity.type || chartType || INLINE_PREFIX
  const data = Array.isArray(entity.data) ? entity.data : []
  const firstRow = data[0] || {}
  const lastRow = data[data.length - 1] || {}
  const signature = [
    data.length,
    firstRow.name ?? firstRow.label ?? firstRow.x ?? "first",
    firstRow.value ?? firstRow.y ?? "value",
    lastRow.name ?? lastRow.label ?? lastRow.x ?? "last",
  ].join("-")

  return `${base}-${signature}`
}

function clampIndex(value, length) {
  const maxIndex = Math.max(0, length - 1)
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(value, maxIndex))
}

function resolveRadiusValue(value, base) {
  if (typeof value === "string" && value.endsWith("%")) {
    return (base * Number.parseFloat(value)) / 100
  }

  if (Number.isFinite(value)) return value
  return base
}

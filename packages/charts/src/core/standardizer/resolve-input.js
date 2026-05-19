/* eslint-disable no-magic-numbers */

const DEFAULT_BRUSH_HEIGHT = 30

const SUPPORTED_CHART_TYPES = new Set([
  "donut",
  "pie",
  "line",
  "area",
  "bar",
  "composed",
])

const SUPPORTED_CHART_TYPE_TOKENS = [...SUPPORTED_CHART_TYPES]

export function mergeEntityInput(source, config) {
  return {
    ...source,
    ...config,
    children: undefined,
    data: config.data ?? source.data ?? [],
    series: config.series ?? source.series,
    brush: config.brush ?? source.brush,
    width: config.width ?? source.width ?? 800,
    height: config.height ?? source.height ?? 400,
    hasGrid: config.hasGrid ?? source.hasGrid,
    hasLegend: config.hasLegend ?? source.hasLegend,
    hasTooltip: config.hasTooltip ?? source.hasTooltip,
    hasLabel: config.hasLabel ?? source.hasLabel,
    padding: config.padding ?? source.padding,
    centerText: config.centerText ?? source.centerText,
    stacked: config.stacked ?? source.stacked,
    colors: config.colors ?? source.colors,
    dataKeys: config.dataKeys ?? source.dataKeys,
  }
}

export function getChartType(entity, primitives) {
  const normalizedType = getChartTypeAlias(entity.type)

  if (normalizedType) return normalizedType

  if (primitives.some((primitive) => primitive.type === "pie")) {
    return entity.centerText ? "donut" : "pie"
  }

  const hasArea = primitives.some((primitive) => primitive.type === "area")
  const hasBar = primitives.some((primitive) => primitive.type === "bar")
  const hasLine = primitives.some((primitive) => primitive.type === "line")

  if ([hasArea, hasBar, hasLine].filter(Boolean).length > 1) return "composed"
  if (hasArea) return "area"
  if (hasBar) return "bar"
  if (hasLine) return "line"

  return "line"
}

export function applyBrushWindow(entity, primitives, isTooltipEnabled) {
  const hasBrushPrimitive = primitives.some(
    (primitive) => primitive.type === "brush",
  )
  const brushEnabled = entity.brush?.enabled || hasBrushPrimitive
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
      isTooltipEnabled,
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
    isTooltipEnabled,
    data: fullData.slice(boundedStart, boundedEnd + 1),
    fullData,
  }
}

function getChartTypeAlias(type) {
  if (typeof type !== "string") return null

  if (SUPPORTED_CHART_TYPES.has(type)) return type

  const tokens = type.toLowerCase().split("-")
  const match = SUPPORTED_CHART_TYPE_TOKENS.find((chartType) =>
    tokens.includes(chartType),
  )

  return match || null
}

export function getTooltipState(entity, primitives) {
  if (primitives.some((primitive) => primitive.type === "tooltip")) return true

  if (primitives.some((primitive) => primitive.props?.hasTooltip === true)) {
    return true
  }

  if (primitives.some((primitive) => primitive.props?.showTooltip === true)) {
    return true
  }

  return entity.hasTooltip === true
}

export function getPrimitives(children) {
  if (!children) return []
  return Array.isArray(children) ? children.filter(Boolean) : [children]
}

export function createStableId(entity, chartType) {
  return `inline-chart-${chartType}-${entity.id || "anonymous"}`
}

export function isObject(value) {
  return value != null && typeof value === "object"
}

function clampIndex(value, length) {
  if (length <= 0) return 0
  return Math.max(0, Math.min(length - 1, value))
}

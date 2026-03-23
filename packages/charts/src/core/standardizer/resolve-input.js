/* eslint-disable no-magic-numbers */

const DEFAULT_BRUSH_HEIGHT = 30
const DEFAULT_HEIGHT = 400
const DEFAULT_WIDTH = 800

const INLINE_PREFIX = "inline-chart"

export function mergeEntityInput(source, config) {
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

const SUPPORTED_CHART_TYPES = new Set([
  "donut",
  "pie",
  "line",
  "area",
  "bar",
  "composed",
])

export function getChartType(entity, components) {
  if (SUPPORTED_CHART_TYPES.has(entity.type)) {
    return entity.type
  }

  if (components.some((component) => component.type === "pie")) {
    return entity.centerText ? "donut" : "pie"
  }

  const hasArea = components.some((component) => component.type === "area")
  const hasBar = components.some((component) => component.type === "bar")
  const hasLine = components.some((component) => component.type === "line")

  if ([hasArea, hasBar, hasLine].filter(Boolean).length > 1) {
    return "composed"
  }

  if (hasArea) return "area"
  if (hasBar) return "bar"
  if (hasLine) return "line"

  return "line"
}

export function getComponents(children) {
  if (!children) return []
  return Array.isArray(children) ? children.filter(Boolean) : [children]
}

export function getTooltipState(entity, components) {
  if (entity.showTooltip === true) return true
  if (entity.showTooltip === false) {
    return components.some((component) => component.type === "tooltip")
  }

  if (components.some((component) => component.type === "tooltip")) {
    return true
  }

  return components.some((component) => component.props?.showTooltip === true)
}

export function applyBrushWindow(entity, components, tooltipEnabled) {
  const hasBrushComponent = components.some(
    (component) => component.type === "brush",
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

export function isObject(value) {
  return value != null && typeof value === "object"
}

export function createStableId(entity, chartType) {
  return `${INLINE_PREFIX}-${chartType}-${entity.id || "anonymous"}`
}

function clampIndex(value, length) {
  if (length <= 0) return 0
  return Math.max(0, Math.min(length - 1, value))
}

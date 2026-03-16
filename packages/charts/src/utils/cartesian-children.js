/* eslint-disable no-magic-numbers */
import { DEFAULT_GRID_CONFIG, DEFAULT_Y_AXIS_CONFIG } from "./constants.js"

export function resolveXAxisDataKey(entity) {
  let dataKey = entity?.dataKey
  if (!dataKey && Array.isArray(entity?.data) && entity.data.length > 0) {
    const firstItem = entity.data[0]
    dataKey = firstItem?.name || firstItem?.x || firstItem?.date || "name"
  }
  return dataKey || "name"
}

export function buildCartesianBaseChildren(
  entity,
  {
    makeChild = (type, config) => ({ type, config }),
    includeGrid = true,
    includeXAxis = true,
    includeYAxis = true,
    includeTooltip = true,
    includeBrush = true,
    gridConfig = DEFAULT_GRID_CONFIG,
    xAxisConfig = {},
    yAxisConfig = DEFAULT_Y_AXIS_CONFIG,
    tooltipConfig = {},
    brushConfig = {},
  } = {},
) {
  const children = []
  if (!entity) return children

  const xAxisDataKey = resolveXAxisDataKey(entity)

  if (includeGrid && entity.showGrid !== false) {
    children.push(makeChild("CartesianGrid", gridConfig))
  }

  if (includeXAxis) {
    children.push(makeChild("XAxis", { dataKey: xAxisDataKey, ...xAxisConfig }))
  }

  if (includeYAxis) {
    children.push(makeChild("YAxis", { ...yAxisConfig }))
  }

  if (includeTooltip && entity.showTooltip !== false) {
    children.push(makeChild("Tooltip", tooltipConfig))
  }

  if (
    includeBrush &&
    entity.brush?.enabled &&
    entity.brush?.visible !== false
  ) {
    children.push(
      makeChild("Brush", {
        dataKey: xAxisDataKey,
        height: entity.brush.height || 30,
        ...brushConfig,
      }),
    )
  }

  return children
}

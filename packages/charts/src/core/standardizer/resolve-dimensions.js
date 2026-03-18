/* eslint-disable no-magic-numbers */

import {
  COMPONENT_TYPES,
  DEFAULT_BRUSH_GAP,
  DEFAULT_BRUSH_HEIGHT,
  DEFAULT_HEIGHT,
  DEFAULT_LEGEND_HEIGHT,
  DEFAULT_WIDTH,
} from "../constants.js"

export function createDimensions(entity, components) {
  const width = entity.width || DEFAULT_WIDTH
  const height = entity.height || DEFAULT_HEIGHT
  const hasLegend = components.some(
    (component) => component.type === COMPONENT_TYPES.LEGEND,
  )
  const brushComponent = components.find(
    (component) => component.type === COMPONENT_TYPES.BRUSH,
  )
  const hasVisibleBrush =
    entity.brush?.enabled &&
    entity.brush?.visible !== false &&
    Boolean(brushComponent)
  const brushHeight = hasVisibleBrush
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

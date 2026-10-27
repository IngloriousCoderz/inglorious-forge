/* eslint-disable no-magic-numbers */

import {
  AXIS_LABEL_ROOM,
  CHAR_WIDTH,
  DEFAULT_BRUSH_HEIGHT,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  LEGEND_HEIGHT,
  LEGEND_ROW_HEIGHT,
  legendItemsPerRow,
} from "../defaults.js"

/**
 * Computes layout dimensions for the engine renderer.
 *
 * Returns plot geometry derived from:
 * - `entity.width` / `entity.height` (or defaults)
 * - `entity.padding` (top/right/bottom/left)
 * - presence of `Legend` and `Brush` primitives
 *
 * @param {any} entity - Normalized chart entity (includes width/height/padding and brush state).
 * @param {any[]} primitives - Primitive list to detect legend/brush.
 * @returns {{width:number,height:number,padding:any,plotTop:number,plotRight:number,plotBottom:number,plotLeft:number,plotWidth:number,plotHeight:number,legendHeight:number,brushHeight:number,brushTop:number|null}}
 */
export function createDimensions(entity, primitives) {
  const width = entity.width || DEFAULT_WIDTH
  const height = entity.height || DEFAULT_HEIGHT
  const hasLegend = primitives.some((primitive) => primitive.type === "legend")
  const brushPrimitive = primitives.find(
    (primitive) => primitive.type === "brush",
  )
  const hasVisibleBrush =
    entity.brush?.enabled &&
    entity.brush?.visible !== false &&
    Boolean(brushPrimitive)
  const brushHeight = hasVisibleBrush
    ? brushPrimitive?.props?.height ||
      entity.brush?.height ||
      DEFAULT_BRUSH_HEIGHT
    : 0
  // An axis title takes room of its own, on its side of the plot.
  const titled = (type) =>
    primitives.some(
      (primitive) => primitive.type === type && primitive.props?.label,
    )
  const xTitleRoom = titled("x-axis") ? AXIS_LABEL_ROOM : 0
  const yTitleRoom = titled("y-axis") ? AXIS_LABEL_ROOM : 0
  // Horizontal bars put their categories' names on the left: room for the
  // longest, estimated from its length as SVG text cannot be measured.
  const categoryRoom =
    entity.orientation === "horizontal"
      ? Math.max(entity.padding.left, longestLabel(entity) * CHAR_WIDTH + 16)
      : entity.padding.left
  const plotLeft = categoryRoom + yTitleRoom
  const plotRight = width - entity.padding.right
  const legendHeight = hasLegend
    ? LEGEND_HEIGHT +
      (countLegendRows(entity, plotRight - plotLeft, primitives) - 1) *
        LEGEND_ROW_HEIGHT
    : 0
  const plotTop = entity.padding.top + legendHeight
  const plotBottom =
    height -
    entity.padding.bottom -
    xTitleRoom -
    (brushHeight > 0 ? brushHeight + 16 : 0)

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

/**
 * A legend has an item per series, or per row for a pie or radial chart, and
 * wraps onto as many rows as they need.
 */
function countLegendRows(entity, plotWidth, primitives) {
  const isPolar = ["pie", "donut", "radial"].includes(entity.type)
  const legend = primitives.find((primitive) => primitive.type === "legend")
  const count = isPolar
    ? (entity.data?.length ?? 0)
    : (legend?.props?.dataKeys?.length ?? entity.seriesKeys?.length ?? 0)
  return Math.max(1, Math.ceil(count / legendItemsPerRow(plotWidth)))
}

function longestLabel(entity) {
  return Math.max(
    0,
    ...(entity.data ?? []).map(
      (row) => String(row?.[entity.xKey] ?? "").length,
    ),
  )
}

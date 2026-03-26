/* eslint-disable no-magic-numbers */

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
  const width = entity.width || 800
  const height = entity.height || 400
  const hasLegend = primitives.some((primitive) => primitive.type === "legend")
  const brushPrimitive = primitives.find(
    (primitive) => primitive.type === "brush",
  )
  const hasVisibleBrush =
    entity.brush?.enabled &&
    entity.brush?.visible !== false &&
    Boolean(brushPrimitive)
  const brushHeight = hasVisibleBrush
    ? brushPrimitive?.props?.height || entity.brush?.height || 30
    : 0
  const legendHeight = hasLegend ? 40 : 0
  const plotTop = entity.padding.top + legendHeight
  const plotBottom =
    height - entity.padding.bottom - (brushHeight > 0 ? brushHeight + 16 : 0)
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

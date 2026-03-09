/* eslint-disable no-magic-numbers */

/**
 * Calculate padding based on chart dimensions
 * @param {number} [width=800] - Chart width
 * @param {number} [height=400] - Chart height
 * @returns {Object} Padding object with top, right, bottom, left
 */
export function calculatePadding(width = 800, height = 400) {
  return {
    top: Math.max(20, height * 0.05),
    right: Math.max(20, width * 0.05),
    bottom: Math.max(40, height * 0.1),
    left: Math.max(50, width * 0.1),
  }
}

/**
 * Resolve effective padding for a chart.
 * Accepts:
 * - number: applies to all sides
 * - partial object: merges with defaults
 * - full object
 * @param {number|{top?:number,right?:number,bottom?:number,left?:number}|undefined|null} padding
 * @param {number} width
 * @param {number} height
 * @returns {{top:number,right:number,bottom:number,left:number}}
 */
export function resolvePadding(padding, width = 800, height = 400) {
  const base = calculatePadding(width, height)

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

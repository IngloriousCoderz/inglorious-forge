const UNIT_SCALE = 1
const LAYOUT_MIN_POSITION_DELTA = 0.5
const LAYOUT_MIN_SCALE_DELTA = 0.01

/**
 * Computes transform deltas between two DOMRects for FLIP layout animation.
 *
 * @param {{ left: number, top: number, width: number, height: number }} fromRect
 * @param {{ left: number, top: number, width: number, height: number }} toRect
 * @returns {{ deltaX: number, deltaY: number, scaleX: number, scaleY: number }}
 */
export function computeLayoutDelta(fromRect, toRect) {
  return {
    deltaX: fromRect.left - toRect.left,
    deltaY: fromRect.top - toRect.top,
    scaleX: toRect.width ? fromRect.width / toRect.width : UNIT_SCALE,
    scaleY: toRect.height ? fromRect.height / toRect.height : UNIT_SCALE,
  }
}

/**
 * Checks whether delta values are large enough to justify animation.
 *
 * @param {{ deltaX: number, deltaY: number, scaleX: number, scaleY: number }} delta
 * @returns {boolean}
 */
export function hasLayoutMovement({ deltaX, deltaY, scaleX, scaleY }) {
  return (
    Math.abs(deltaX) > LAYOUT_MIN_POSITION_DELTA ||
    Math.abs(deltaY) > LAYOUT_MIN_POSITION_DELTA ||
    Math.abs(scaleX - UNIT_SCALE) > LAYOUT_MIN_SCALE_DELTA ||
    Math.abs(scaleY - UNIT_SCALE) > LAYOUT_MIN_SCALE_DELTA
  )
}

export { UNIT_SCALE }

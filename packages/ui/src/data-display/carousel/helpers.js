import { clamp } from "@inglorious/utils/math/numbers.js"

export const DEFAULT_AXIS = "x"
export const VERTICAL_AXIS = "y"
export const DEFAULT_GAP = "none"
export const DEFAULT_ALIGN = "stretch"
export const DEFAULT_ARROW_PLACEMENT = "inside"
export const DEFAULT_ARROW_VARIANT = "default"
export const FIRST_PAGE = 0
export const NO_ROTATION = 0

/**
 * Bring a rotation into the `0 .. len - 1` range, wrapping negatives.
 * @param {number} rotation
 * @param {number} length
 * @returns {number}
 */
export function normalizeRotation(rotation, length) {
  if (length <= 0) return NO_ROTATION
  return ((rotation % length) + length) % length
}

/**
 * Rotate items so that `items[rotation]` becomes the first one — this is how an
 * infinite carousel turns `[1, 2, 3, 4, 5]` into `[2, 3, 4, 5, 1]` instead of
 * rewinding all the way back to the start.
 * @param {unknown[]} [items]
 * @param {number} [rotation]
 * @returns {unknown[]}
 */
export function rotateItems(items = [], rotation = NO_ROTATION) {
  if (!items.length) return items
  const at = normalizeRotation(rotation, items.length)
  return items.slice(at).concat(items.slice(0, at))
}

/**
 * Get the index of the last available page.
 * @param {unknown[]} [items]
 * @returns {number}
 */
export function getLastPage(items = []) {
  return Math.max(FIRST_PAGE, items.length - 1)
}

/**
 * The slot an infinite carousel keeps the current item in: the middle, so there
 * is always a buffer of items to scroll or drag into on either side.
 * @param {number} length
 * @returns {number}
 */
export function carouselHome(length) {
  return Math.floor((length ?? 0) / 2)
}

/**
 * Keep a page index within the available pages.
 * @param {number} page
 * @param {unknown[]} [items]
 * @returns {number}
 */
export function clampPage(page, items) {
  return clamp(page, FIRST_PAGE, getLastPage(items))
}

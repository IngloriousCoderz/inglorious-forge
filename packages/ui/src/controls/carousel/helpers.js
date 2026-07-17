import { clamp } from "@inglorious/utils/math/numbers.js"

export const DEFAULT_AXIS = "x"
export const VERTICAL_AXIS = "y"
export const DEFAULT_GAP = "none"
export const DEFAULT_ALIGN = "stretch"
export const FIRST_PAGE = 0

/**
 * Get the index of the last available page.
 * @param {unknown[]} [items]
 * @returns {number}
 */
export function getLastPage(items = []) {
  return Math.max(FIRST_PAGE, items.length - 1)
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

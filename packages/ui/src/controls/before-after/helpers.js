export const DEFAULT_POSITION = 50
export const DEFAULT_STEP = 1
export const MIN_POSITION = 0
export const MAX_POSITION = 100

/**
 * Keep a divider position within the 0-100 range.
 * @param {number} position
 * @returns {number}
 */
export function clamp(position) {
  return Math.max(MIN_POSITION, Math.min(MAX_POSITION, position))
}

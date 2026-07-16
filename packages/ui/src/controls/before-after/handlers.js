/**
 * @typedef {import('../../../types/controls/before-after.js').BeforeAfterProps} BeforeAfterEntity
 */

import { clamp, DEFAULT_POSITION, DEFAULT_STEP } from "./helpers.js"

/**
 * Initialize missing before/after state defaults.
 * The only persistent piece of state is `position`: the divider location as a
 * percentage (0-100). Everything else is configuration.
 * @param {BeforeAfterEntity} entity
 */
export function create(entity) {
  entity.position ??= DEFAULT_POSITION
  entity.step ??= DEFAULT_STEP

  entity.before ??= null
  entity.after ??= null

  entity.label ??= ""
  entity.isDisabled ??= false
  entity.isFullWidth ??= false
}

/**
 * Move the divider to a new position, clamped to the 0-100 range.
 * @param {BeforeAfterEntity} entity
 * @param {number} position
 */
export function positionChange(entity, position) {
  if (entity.isDisabled) return

  const value = Number(position)
  if (Number.isNaN(value)) return

  entity.position = clamp(value)
}

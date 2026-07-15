/**
 * @typedef {import('../../../types/controls/before-after.js').BeforeAfterProps} BeforeAfterEntity
 */

const DEFAULT_POSITION = 50
const DEFAULT_STEP = 1
const MIN_POSITION = 0
const MAX_POSITION = 100

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
export function setPosition(entity, position) {
  if (entity.isDisabled) return

  const value = Number(position)
  if (Number.isNaN(value)) return

  entity.position = Math.max(MIN_POSITION, Math.min(MAX_POSITION, value))
}

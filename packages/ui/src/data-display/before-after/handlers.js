/**
 * @typedef {import('../../../types/data-display/before-after.js').BeforeAfterProps} BeforeAfterEntity
 */

import { clamp } from "@inglorious/utils/math/numbers.js"

import {
  DEFAULT_POSITION,
  DEFAULT_STEP,
  MAX_POSITION,
  MIN_POSITION,
} from "./helpers.js"

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

  entity.position = clamp(value, MIN_POSITION, MAX_POSITION)
}

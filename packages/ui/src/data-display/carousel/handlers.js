/**
 * @typedef {import('../../../types/data-display/carousel.js').CarouselProps} CarouselEntity
 */

import {
  carouselHome,
  clampPage,
  DEFAULT_ALIGN,
  DEFAULT_ARROW_PLACEMENT,
  DEFAULT_ARROW_VARIANT,
  DEFAULT_AXIS,
  DEFAULT_GAP,
  FIRST_PAGE,
  NO_ROTATION,
  normalizeRotation,
} from "./helpers.js"

const ENOUGH_TO_WRAP = 1

/**
 * Initialize missing carousel state defaults.
 * The only persistent piece of state is `page`: the index of the item the
 * viewport has settled on. Everything else is configuration.
 * @param {CarouselEntity} entity
 */
export function create(entity) {
  entity.items ??= []
  entity.page ??= FIRST_PAGE
  entity.rotation ??= NO_ROTATION

  entity.isInfinite ??= false
  entity.axis ??= DEFAULT_AXIS
  entity.gap ??= DEFAULT_GAP
  entity.align ??= DEFAULT_ALIGN

  entity.arrowPlacement ??= DEFAULT_ARROW_PLACEMENT
  entity.arrowVariant ??= DEFAULT_ARROW_VARIANT

  entity.label ??= ""
  entity.hasArrows ??= true
  entity.hasIndicators ??= true
  entity.isFullWidth ??= false

  // An infinite carousel keeps the current item in the middle slot, so the
  // starting item is placed there by rotating the strip up front.
  if (entity.isInfinite && entity.items.length > ENOUGH_TO_WRAP) {
    const home = carouselHome(entity.items.length)
    entity.rotation = normalizeRotation(entity.page - home, entity.items.length)
    entity.page = home
  }
}

/**
 * Settle on another page, clamped to the available items.
 * @param {CarouselEntity} entity
 * @param {number} page
 */
export function pageChange(entity, page) {
  const value = Number(page)
  if (Number.isNaN(value)) return

  entity.page = clampPage(value, entity.items)
}

/**
 * Rotate the items by `step` (wrapping), which is how an infinite carousel
 * continues forward past the end instead of rewinding to the start.
 * @param {CarouselEntity} entity
 * @param {number} step
 */
export function rotate(entity, step) {
  const value = Number(step)
  if (Number.isNaN(value)) return

  entity.rotation = normalizeRotation(
    (entity.rotation ?? NO_ROTATION) + value,
    entity.items?.length ?? 0,
  )
}

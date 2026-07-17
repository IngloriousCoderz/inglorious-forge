/**
 * @typedef {import('../../../types/controls/carousel.js').CarouselProps} CarouselEntity
 */

import {
  clampPage,
  DEFAULT_ALIGN,
  DEFAULT_AXIS,
  DEFAULT_GAP,
  FIRST_PAGE,
} from "./helpers.js"

/**
 * Initialize missing carousel state defaults.
 * The only persistent piece of state is `page`: the index of the item the
 * viewport has settled on. Everything else is configuration.
 * @param {CarouselEntity} entity
 */
export function create(entity) {
  entity.items ??= []
  entity.page ??= FIRST_PAGE

  entity.axis ??= DEFAULT_AXIS
  entity.gap ??= DEFAULT_GAP
  entity.align ??= DEFAULT_ALIGN

  entity.label ??= ""
  entity.hasArrows ??= true
  entity.hasIndicators ??= true
  entity.isFullWidth ??= false
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

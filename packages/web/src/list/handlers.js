/**
 * @typedef {import('../../types/list').ListEntity} ListEntity
 * @typedef {import('../../types/mount').Api} Api
 * @typedef {import('lit-html').TemplateResult} TemplateResult
 */

const LIST_START = 0

/**
 * Initializes the list entity with default state.
 * @param {ListEntity} entity
 */
export function create(entity) {
  resetList(entity)
}

/**
 * Handles the scroll event to update the visible range.
 * @param {ListEntity} entity
 * @param {HTMLElement} containerEl
 */
export function scroll(entity, containerEl) {
  const scrollTop = containerEl.scrollTop
  const { items, bufferSize, itemHeight, estimatedHeight, viewportHeight } =
    entity
  const height = itemHeight || estimatedHeight

  const start = Math.max(
    LIST_START,
    Math.floor(scrollTop / height) - bufferSize,
  )
  const visibleCount = Math.ceil(viewportHeight / height)
  const end = Math.min(start + visibleCount + bufferSize, items.length)

  if (entity.visibleRange.start === start && entity.visibleRange.end === end) {
    return
  }

  entity.scrollTop = scrollTop
  entity.visibleRange = { start, end }
}

/**
 * Mounts the list, measuring the first item to determine item height.
 * @param {ListEntity} entity
 * @param {HTMLElement} containerEl
 */
export function mount(entity, containerEl) {
  const firstItem = containerEl.querySelector("[data-index]")
  if (!firstItem) return

  entity.itemHeight = firstItem.offsetHeight
  entity.visibleRange = {
    start: 0,
    end: Math.ceil(entity.viewportHeight / entity.itemHeight),
  }
}

/**
 * Resets the list entity state.
 * @param {ListEntity} entity
 */
function resetList(entity) {
  entity.scrollTop = 0
  entity.visibleRange ??= { start: 0, end: 20 }
  entity.viewportHeight ??= 600
  entity.bufferSize ??= 5
  entity.itemHeight ??= null
  entity.estimatedHeight ??= 50
}

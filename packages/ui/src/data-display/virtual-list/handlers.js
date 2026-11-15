/**
 * @typedef {import('../../../types/data-display/virtual-list').VirtualListEntity} VirtualListEntity
 */

const LIST_START = 0

/**
 * Initializes the virtual list entity with default state.
 * @param {VirtualListEntity} entity
 */
export function create(entity) {
  resetList(entity)
}

/**
 * Updates the visible range for a scroll position.
 * @param {VirtualListEntity} entity
 * @param {{ scrollTop: number }} payload
 */
export function scroll(entity, { scrollTop }) {
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
 * Takes the height of an item, as measured on the first one laid out.
 * @param {VirtualListEntity} entity
 * @param {{ itemHeight: number }} payload
 */
export function itemMeasure(entity, { itemHeight }) {
  if (!itemHeight) return

  entity.itemHeight = itemHeight
  entity.visibleRange = {
    start: 0,
    end: Math.min(
      Math.ceil(entity.viewportHeight / entity.itemHeight),
      entity.items?.length ?? Infinity,
    ),
  }
}

/**
 * Resets the list entity state.
 * @param {VirtualListEntity} entity
 */
function resetList(entity) {
  entity.scrollTop = 0
  entity.visibleRange ??= { start: 0, end: 20 }
  entity.viewportHeight ??= 600
  entity.bufferSize ??= 5
  entity.itemHeight ??= null
  entity.estimatedHeight ??= 50
}

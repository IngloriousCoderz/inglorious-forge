/**
 * @typedef {import("../../types/element-size.js").ElementSizeEntity} ElementSizeEntity
 * @typedef {import("../../types/element-size.js").ElementSizeSize} ElementSizeSize
 */

// Observers aren't serializable, so they're kept here by id, not on the entity.
const observers = new Map()

/**
 * Initializes the entity state and starts observing the target element's size.
 * @param {ElementSizeEntity} entity - The element size entity.
 * @param {{ notify: Function }} api - The store API.
 */
export function create(entity, _, api) {
  entity.width ??= null
  entity.height ??= null
  entity.selector ??= null
  entity.isSupported = isSupported()
  entity.isWatching ??= false

  elementSizeWatch(entity, _, api)
}

/**
 * Disconnects the observer before the entity is destroyed.
 * @param {ElementSizeEntity} entity - The element size entity.
 */
export function destroy(entity) {
  elementSizeUnwatch(entity)
}

/**
 * Starts observing the target element for size changes.
 * @param {ElementSizeEntity} entity - The element size entity.
 * @param {{ notify: Function }} api - The store API.
 */
export function elementSizeWatch(entity, _, api) {
  entity.isSupported = isSupported()

  if (!entity.isSupported || observers.has(entity.id)) {
    return
  }

  const element = getElement(entity)

  if (!element) {
    return
  }

  // Snapshot the id while the draft proxy is still live: the callback below
  // runs after this handler returns, when Mutative has revoked the draft.
  const id = entity.id

  const observer = new globalThis.ResizeObserver((entries) => {
    api.notify(`#${id}:elementSizeChange`, getSize(entries))
  })
  observer.observe(element)

  observers.set(id, observer)
  entity.isWatching = true
}

/**
 * Stores the latest observed dimensions.
 * @param {ElementSizeEntity} entity - The element size entity.
 * @param {ElementSizeSize} size - The observed dimensions.
 */
export function elementSizeChange(entity, size) {
  entity.width = size.width
  entity.height = size.height
}

/**
 * Stops observing size changes and drops the observer from the registry.
 * @param {ElementSizeEntity} entity - The element size entity.
 */
export function elementSizeUnwatch(entity) {
  const observer = observers.get(entity.id)

  if (observer) {
    observer.disconnect()
    observers.delete(entity.id)
  }

  entity.isWatching = false
}

function getSize(entries) {
  const [entry] = entries
  const rect = entry.contentRect
  return { width: rect.width, height: rect.height }
}

function getElement(entity) {
  const doc = globalThis.document

  if (!doc) {
    return null
  }

  const selected = entity.selector ? doc.querySelector(entity.selector) : null
  return selected ?? doc.documentElement
}

function isSupported() {
  return (
    typeof globalThis.ResizeObserver !== "undefined" &&
    Boolean(globalThis.document?.documentElement)
  )
}

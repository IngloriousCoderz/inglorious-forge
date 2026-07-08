/**
 * @typedef {import("../../types/viewport.js").ViewportEntity} ViewportEntity
 * @typedef {import("../../types/viewport.js").ViewportSize} ViewportSize
 */

const NO_LISTENER = null

/**
 * Initializes the entity state, seeds the current window size, and starts
 * watching for resize changes.
 * @param {ViewportEntity} entity - The viewport entity.
 * @param {unknown} _payload - Unused.
 * @param {{ notify: Function }} api - The store API.
 */
export function create(entity, _payload, api) {
  entity.width ??= null
  entity.height ??= null
  entity.isSupported = isSupported()
  entity.isWatching ??= false
  entity._listener ??= NO_LISTENER

  viewportWatch(entity, _payload, api)
}

/**
 * Removes the resize listener before the entity is destroyed.
 * @param {ViewportEntity} entity - The viewport entity.
 */
export function destroy(entity) {
  viewportUnwatch(entity)
}

/**
 * Starts listening to window resize events and seeds the current size.
 * @param {ViewportEntity} entity - The viewport entity.
 * @param {unknown} _payload - Unused.
 * @param {{ notify: Function }} api - The store API.
 */
export function viewportWatch(entity, _payload, api) {
  entity.isSupported = isSupported()

  if (!entity.isSupported || entity._listener !== NO_LISTENER) {
    return
  }

  // Snapshot the id while the draft proxy is still live: the listener below
  // runs after this handler returns, when Mutative has revoked the draft.
  const id = entity.id
  const win = getWindow()

  const listener = () => {
    api.notify(`#${id}:viewportChange`, getSize())
  }
  win.addEventListener("resize", listener)

  entity._listener = listener
  entity.isWatching = true

  // Seed the initial size while the draft is still live.
  const size = getSize()
  entity.width = size.width
  entity.height = size.height
}

/**
 * Stores the latest window dimensions.
 * @param {ViewportEntity} entity - The viewport entity.
 * @param {ViewportSize} size - The window dimensions.
 */
export function viewportChange(entity, size) {
  entity.width = size.width
  entity.height = size.height
}

/**
 * Stops listening to window resize events.
 * @param {ViewportEntity} entity - The viewport entity.
 */
export function viewportUnwatch(entity) {
  const win = getWindow()

  if (entity._listener !== NO_LISTENER && win) {
    win.removeEventListener("resize", entity._listener)
  }

  entity._listener = NO_LISTENER
  entity.isWatching = false
}

function getSize() {
  const win = getWindow()
  return { width: win.innerWidth, height: win.innerHeight }
}

function getWindow() {
  return typeof window !== "undefined" ? window : null
}

function isSupported() {
  return Boolean(getWindow()?.addEventListener)
}

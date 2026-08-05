/**
 * @typedef {import("../../../types/sensors/page-visibility.js").PageVisibilityEntity} PageVisibilityEntity
 */

const VISIBILITY_EVENT = "visibilitychange"
const listeners = new Map()

export function create(entity, _, api) {
  entity.isSupported = isSupported()
  entity.isVisible = getVisibilityState()
  entity.isWatching ??= false

  pageVisibilityWatch(entity, _, api)
}

export function destroy(entity) {
  pageVisibilityUnwatch(entity)
}

export function pageVisibilityChange(entity, value) {
  entity.isVisible = value
}

export function pageVisibilityWatch(entity, _, api) {
  entity.isSupported = isSupported()

  if (!entity.isSupported || entity.isWatching) {
    return
  }

  const doc = getDocument()
  if (!doc) {
    return
  }

  // Snapshot the id while the draft proxy is still live: the callback below
  // runs after this handler returns, when Mutative has revoked the draft.
  const id = entity.id
  const listener = () => api.notify(`#${id}:pageVisibilityChange`, !doc.hidden)

  listeners.set(id, listener)
  doc.addEventListener(VISIBILITY_EVENT, listener)
  entity.isWatching = true
}

export function pageVisibilityUnwatch(entity) {
  const doc = getDocument()
  const listener = listeners.get(entity.id)

  if (listener && doc) {
    doc.removeEventListener(VISIBILITY_EVENT, listener)
    listeners.delete(entity.id)
  }

  entity.isWatching = false
}

function getDocument() {
  return typeof document !== "undefined" ? document : null
}

function getVisibilityState() {
  const doc = getDocument()
  return doc?.visibilityState !== "hidden"
}

function isSupported() {
  return Boolean(getDocument()?.visibilityState)
}

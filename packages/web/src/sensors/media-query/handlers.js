/**
 * @typedef {import("../../../types/sensors/media-query.js").MediaQueryEntity} MediaQueryEntity
 * @typedef {import("../../../types/sensors/media-query.js").MediaQueryMatchEvent} MediaQueryMatchEvent
 */

const listeners = new Map()

export function create(entity, _, api) {
  entity.isSupported = isSupported()
  entity.matches = getMatchState(entity)
  entity.media = entity.media ?? ""
  entity.isWatching ??= false

  mediaQueryWatch(entity, _, api)
}

export function destroy(entity) {
  mediaQueryUnwatch(entity)
}

export function mediaQueryChange(entity, event) {
  entity.matches = event.matches
}

export function mediaQueryWatch(entity, _, api) {
  entity.isSupported = isSupported()

  if (!entity.isSupported || entity.isWatching) {
    return
  }

  const mql = getMediaQueryList(entity)
  if (!mql) {
    return
  }

  // Snapshot the id while the draft proxy is still live: the callback below
  // runs after this handler returns, when Mutative has revoked the draft.
  const id = entity.id
  const listener = (event) => api.notify(`#${id}:mediaQueryChange`, event)

  listeners.set(id, { mql, listener })
  entity.isWatching = true

  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", listener)
  } else if (typeof mql.addListener === "function") {
    mql.addListener(listener)
  }
}

export function mediaQueryUnwatch(entity) {
  const registration = listeners.get(entity.id)

  if (!registration) {
    entity.isWatching = false
    return
  }

  const { mql, listener } = registration

  if (typeof mql.removeEventListener === "function") {
    mql.removeEventListener("change", listener)
  } else if (typeof mql.removeListener === "function") {
    mql.removeListener(listener)
  }

  listeners.delete(entity.id)
  entity.isWatching = false
}

function getMediaQueryList(entity) {
  if (typeof globalThis.matchMedia !== "function") {
    return null
  }

  return globalThis.matchMedia(entity.media ?? "")
}

function getMatchState(entity) {
  return getMediaQueryList(entity)?.matches ?? false
}

function isSupported() {
  return typeof globalThis.matchMedia === "function"
}

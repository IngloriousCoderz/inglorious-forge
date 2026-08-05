/**
 * @typedef {import("../../../types/sensors/network-status.js").NetworkStatusEntity} NetworkStatusEntity
 */

const ONLINE_EVENT = "online"
const OFFLINE_EVENT = "offline"
const listeners = new Map()

export function create(entity, _, api) {
  entity.isSupported = isSupported()
  entity.isOnline = getOnlineState()
  entity.isWatching ??= false

  networkStatusWatch(entity, _, api)
}

export function destroy(entity) {
  networkStatusUnwatch(entity)
}

export function networkStatusChange(entity, value) {
  entity.isOnline = value
}

export function networkStatusWatch(entity, _, api) {
  entity.isSupported = isSupported()

  if (!entity.isSupported || entity.isWatching) {
    return
  }

  const win = getWindow()
  if (!win) {
    return
  }

  entity.isOnline = getOnlineState()

  // Snapshot the id while the draft proxy is still live: the callbacks below
  // run after this handler returns, when Mutative has revoked the draft.
  const id = entity.id
  const onlineListener = () => api.notify(`#${id}:networkStatusChange`, true)
  const offlineListener = () => api.notify(`#${id}:networkStatusChange`, false)

  listeners.set(id, { onlineListener, offlineListener })

  win.addEventListener(ONLINE_EVENT, onlineListener)
  win.addEventListener(OFFLINE_EVENT, offlineListener)
  entity.isWatching = true
}

export function networkStatusUnwatch(entity) {
  const win = getWindow()
  const listenerPair = listeners.get(entity.id)

  if (!listenerPair) {
    entity.isWatching = false
    return
  }

  if (win) {
    win.removeEventListener(ONLINE_EVENT, listenerPair.onlineListener)
    win.removeEventListener(OFFLINE_EVENT, listenerPair.offlineListener)
  }

  listeners.delete(entity.id)
  entity.isWatching = false
}

function getWindow() {
  return typeof window !== "undefined" ? window : null
}

function getOnlineState() {
  return Boolean(globalThis.navigator?.onLine)
}

function isSupported() {
  return (
    typeof window !== "undefined" &&
    Boolean(window.addEventListener) &&
    typeof globalThis.navigator?.onLine === "boolean"
  )
}

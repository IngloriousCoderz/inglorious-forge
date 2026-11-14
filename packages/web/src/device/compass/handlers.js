/**
 * @typedef {import("../../../types/device/compass.js").CompassEntity} CompassEntity
 * @typedef {import("../../../types/device/compass.js").CompassError} CompassError
 */

const COMPASS_TIMEOUT = 3000

const FULL_CIRCLE = 360
const DEFAULT_ORIENTATION = 0
const DEFAULT_ERROR_CODE = 0

const watches = new Map()

export function create(entity) {
  entity.error ??= null
  entity.heading ??= null
  entity.isActive ??= false
  entity.isPermissionGranted ??= false
  entity.isLoading ??= false
  entity.isSupported = isCompassSupported()
  entity.manualOffset ??= 0
}

export function destroy(entity) {
  compassUnwatch(entity)
}

export function compassUnwatch(entity) {
  watches.get(entity.id)?.()
  watches.delete(entity.id)
  entity.isLoading = false
  entity.isActive = false
}

export function compassError(entity, error) {
  entity.error = normalizeError(error)
  entity.isLoading = false
  entity.isPermissionGranted = false
}

export function compassPermissionsRequest(entity, _, api) {
  const { id } = entity
  entity.isSupported = isCompassSupported()
  entity.error = null

  if (!entity.isSupported) {
    api.notify(`#${id}:compassError`, createUnsupportedError())
    return
  }

  entity.isLoading = true
  requestPermission().then(
    (permission) =>
      permission === "granted"
        ? api.notify(`#${id}:compassPermissionsGrant`)
        : api.notify(`#${id}:compassError`, createPermissionDeniedError()),
    (error) => api.notify(`#${id}:compassError`, error),
  )
}

export function compassPermissionsGrant(entity) {
  entity.isLoading = false
  entity.isPermissionGranted = true
}

export function compassWatch(entity, _, api) {
  const { id, manualOffset } = entity
  const win = getWindow()
  if (!win || watches.has(id)) return

  const timeoutId = setTimeout(
    () => api.notify(`#${id}:compassActiveChange`, false),
    COMPASS_TIMEOUT,
  )

  const onOrientation = (event) => {
    if (typeof event?.alpha !== "number") return
    clearTimeout(timeoutId)
    api.notify(`#${id}:compassActiveChange`, true)
    api.notify(
      `#${id}:compassHeadingChange`,
      heading(event.alpha, manualOffset),
    )
  }

  let isUsingAbsolute = false
  const onAbsolute = (event) => {
    if (!isUsingAbsolute) {
      isUsingAbsolute = true
      win.removeEventListener("deviceorientation", onOrientation)
    }
    onOrientation(event)
  }

  win.addEventListener("deviceorientationabsolute", onAbsolute)
  win.addEventListener("deviceorientation", onOrientation)

  watches.set(id, () => {
    clearTimeout(timeoutId)
    win.removeEventListener("deviceorientation", onOrientation)
    win.removeEventListener("deviceorientationabsolute", onAbsolute)
  })
}

export function compassActiveChange(entity, value) {
  entity.isActive = value
}

export function compassHeadingChange(entity, value) {
  entity.isLoading = false
  entity.heading = value
}

function heading(alpha, manualOffset) {
  const degrees = alpha - getScreenAngle() + manualOffset
  return Math.round(((degrees % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE)
}

function requestPermission() {
  return (
    globalThis.DeviceOrientationEvent?.requestPermission?.() ??
    Promise.resolve("granted")
  )
}

function getWindow() {
  return typeof window !== "undefined" ? window : null
}

function getScreenAngle() {
  const win = getWindow()
  return (
    win?.screen?.orientation?.angle ?? win?.orientation ?? DEFAULT_ORIENTATION
  )
}

function isCompassSupported() {
  return (
    typeof DeviceOrientationEvent !== "undefined" &&
    Boolean(getWindow()?.addEventListener)
  )
}

function createUnsupportedError() {
  return {
    code: 0,
    message: "Compass is not supported by this environment.",
  }
}

function createPermissionDeniedError() {
  return {
    code: 1,
    message: "Compass permission denied.",
  }
}

function normalizeError(error) {
  return {
    code: error?.code ?? DEFAULT_ERROR_CODE,
    message: error?.message ?? String(error),
  }
}

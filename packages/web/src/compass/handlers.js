/**
 * @typedef {import("../../types/compass.js").CompassEntity} CompassEntity
 * @typedef {import("../../types/compass.js").CompassError} CompassError
 */

const COMPASS_TIMEOUT = 3000
const NO_TIMEOUT = null

const FULL_CIRCLE = 360
const DEFAULT_ORIENTATION = 0
const DEFAULT_ERROR_CODE = 0

export function create(entity) {
  entity.error ??= null
  entity.heading ??= null
  entity.isActive ??= false
  entity.isPermissionGranted ??= false
  entity.isLoading ??= false
  entity.isSupported = isCompassSupported()
  entity.manualOffset ??= 0
  entity._absoluteListener ??= null
  entity._cancelTimeout ??= null
  entity._orientationListener ??= null
}

export function destroy(entity) {
  compassUnwatch(entity)
}

export function compassUnwatch(entity) {
  const win = getWindow()

  if (entity._orientationListener && win) {
    win.removeEventListener("deviceorientation", entity._orientationListener)
  }

  if (entity._absoluteListener && win) {
    win.removeEventListener(
      "deviceorientationabsolute",
      entity._absoluteListener,
    )
  }

  if (entity._cancelTimeout) {
    entity._cancelTimeout()
  }

  entity.isLoading = false
  entity.isActive = false
  entity._orientationListener = null
  entity._absoluteListener = null
  entity._cancelTimeout = null
}

export function compassError(entity, error) {
  entity.error = normalizeError(error)
  entity.isLoading = false
  entity.isPermissionGranted = false
}

export async function compassPermissionsRequest(entity, _, api) {
  entity.isSupported = isCompassSupported()
  entity.error = null

  if (!entity.isSupported) {
    entity.isLoading = false
    api.notify("compassError", createUnsupportedError())
    return
  }

  entity.isLoading = true

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    try {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission === "granted") {
        api.notify("compassPermissionsGrant")
      } else {
        entity.isLoading = false
        api.notify("compassError", createPermissionDeniedError())
      }
    } catch (error) {
      entity.isLoading = false
      api.notify("compassError", normalizeError(error))
    }
  } else {
    api.notify("compassPermissionsGrant")
  }
}

export function compassPermissionsGrant(entity) {
  entity.isLoading = false
  entity.isPermissionGranted = true
}

export function compassWatch(entity, _, api) {
  // Snapshot values from the entity while the proxy is still live.
  // Closures must not access `entity` after this handler returns, as
  // Mutative revokes the draft proxy at that point.
  const manualOffset = entity.manualOffset

  let isUsingAbsolute = false
  let timeoutId = NO_TIMEOUT

  const cancelTimeout = () => {
    if (timeoutId !== NO_TIMEOUT) {
      clearTimeout(timeoutId)
      timeoutId = NO_TIMEOUT
    }
  }

  const orientationListener = createOrientationChangeListener(
    cancelTimeout,
    manualOffset,
    api,
  )

  const absoluteListener = (event) => {
    if (!isUsingAbsolute) {
      isUsingAbsolute = true
      getWindow()?.removeEventListener("deviceorientation", orientationListener)
    }

    orientationListener(event)
  }

  entity._orientationListener = orientationListener
  entity._absoluteListener = absoluteListener
  entity._cancelTimeout = cancelTimeout

  const win = getWindow()
  win?.addEventListener("deviceorientationabsolute", absoluteListener)
  win?.addEventListener("deviceorientation", orientationListener)

  timeoutId = globalThis.setTimeout(() => {
    timeoutId = NO_TIMEOUT
    api.notify("compassActiveChange", false)
  }, COMPASS_TIMEOUT)
}

export function compassActiveChange(entity, value) {
  entity.isActive = value
}

export function compassHeadingChange(entity, value) {
  entity.isLoading = false
  entity.heading = value
}

function createOrientationChangeListener(cancelTimeout, manualOffset, api) {
  return (event) => {
    const heading = event?.alpha
    if (typeof heading !== "number") {
      return
    }

    cancelTimeout()

    const screenAngle = getScreenAngle()
    const adjustedHeading =
      (((heading - screenAngle + manualOffset) % FULL_CIRCLE) + FULL_CIRCLE) %
      FULL_CIRCLE

    api.notify("compassActiveChange", true)
    api.notify("compassHeadingChange", Math.round(adjustedHeading))
  }
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

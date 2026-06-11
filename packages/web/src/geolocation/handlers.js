/**
 * @typedef {import("../../types/geolocation.js").GeolocationEntity} GeolocationEntity
 * @typedef {import("../../types/geolocation.js").GeolocationOptions} GeolocationOptions
 * @typedef {import("../../types/geolocation.js").GeolocationPosition} GeolocationPosition
 */

const NO_WATCH_ID = null

/**
 * Initializes the geolocation entity with default state.
 * @param {GeolocationEntity} entity - The geolocation entity.
 */
export function create(entity) {
  entity.error ??= null
  entity.isLoading ??= false
  entity.isSupported = Boolean(getGeolocation())
  entity.isWatching ??= false
  entity.position ??= null
  entity.watchId ??= NO_WATCH_ID
}

/**
 * Clears the geolocation watch before the entity is destroyed.
 * @param {GeolocationEntity} entity - The geolocation entity.
 */
export function destroy(entity) {
  geolocationUnwatch(entity)
}

/**
 * Stores a normalized geolocation error.
 * @param {GeolocationEntity} entity - The geolocation entity.
 * @param {GeolocationPositionError} error - The geolocation error.
 */
export function geolocationError(entity, error) {
  entity.error = normalizeError(error)
  entity.isLoading = false
}

/**
 * Requests the current geolocation position.
 * @param {GeolocationEntity} entity - The geolocation entity.
 * @param {GeolocationOptions} options - Position options.
 * @param {{ notify: Function }} api - The store API.
 */
export function geolocationRequest(entity, options = {}, api) {
  const geolocation = getGeolocation()

  entity.isSupported = Boolean(geolocation)
  entity.error = null

  if (!geolocation) {
    entity.isLoading = false
    api.notify("geolocationError", createUnsupportedError())
    return
  }

  entity.isLoading = true

  geolocation.getCurrentPosition(
    (position) => {
      api.notify("geolocationSuccess", normalizePosition(position))
    },
    (error) => {
      api.notify("geolocationError", error)
    },
    options,
  )
}

/**
 * Stores a normalized geolocation position.
 * @param {GeolocationEntity} entity - The geolocation entity.
 * @param {GeolocationPosition} position - The geolocation position.
 */
export function geolocationSuccess(entity, position) {
  entity.error = null
  entity.isLoading = false
  entity.position = position
}

/**
 * Stops an active geolocation watch.
 * @param {GeolocationEntity} entity - The geolocation entity.
 */
export function geolocationUnwatch(entity) {
  const geolocation = getGeolocation()

  if (entity.watchId !== NO_WATCH_ID && geolocation) {
    geolocation.clearWatch(entity.watchId)
  }

  entity.isLoading = false
  entity.isWatching = false
  entity.watchId = NO_WATCH_ID
}

/**
 * Starts watching geolocation changes.
 * @param {GeolocationEntity} entity - The geolocation entity.
 * @param {GeolocationOptions} options - Watch options.
 * @param {{ notify: Function }} api - The store API.
 */
export function geolocationWatch(entity, options = {}, api) {
  const geolocation = getGeolocation()

  entity.isSupported = Boolean(geolocation)
  entity.error = null

  if (!geolocation) {
    entity.isLoading = false
    api.notify("geolocationError", createUnsupportedError())
    return
  }

  if (entity.watchId !== NO_WATCH_ID) {
    return
  }

  entity.isLoading = true
  entity.isWatching = true
  entity.watchId = geolocation.watchPosition(
    (position) => {
      api.notify("geolocationSuccess", normalizePosition(position))
    },
    (error) => {
      api.notify("geolocationError", error)
    },
    options,
  )
}

function createUnsupportedError() {
  return {
    code: 0,
    message: "Geolocation is not supported by this environment.",
  }
}

function getGeolocation() {
  return globalThis.navigator?.geolocation
}

function normalizeCoords(coords) {
  return {
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    latitude: coords.latitude,
    longitude: coords.longitude,
    speed: coords.speed,
  }
}

function normalizeError(error) {
  return {
    code: error.code,
    message: error.message,
  }
}

function normalizePosition(position) {
  return {
    coords: normalizeCoords(position.coords),
    timestamp: position.timestamp,
  }
}

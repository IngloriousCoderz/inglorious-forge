import { isNative } from "../../native/index.js"

const UNSUPPORTED = {
  code: 0,
  message: "Geolocation is not supported by this environment.",
}

const watches = new Map()

/**
 * The type behind a position: `geolocationRequest` reads it once,
 * `geolocationWatch` follows it until `geolocationUnwatch`. In a native app it
 * uses `Geolocation` from `@capacitor/geolocation` when given as `plugin`, so
 * iOS asks once, for the app; elsewhere `navigator.geolocation`.
 *
 * @param {{ plugin?: object }} [config]
 *
 * @example
 * import { Geolocation } from "@capacitor/geolocation"
 * const types = { Geolocation: createGeolocation({ plugin: Geolocation }) }
 * api.notify("#geolocation:geolocationRequest", { enableHighAccuracy: true })
 */
export function createGeolocation({ plugin } = {}) {
  const source = () =>
    plugin && isNative()
      ? fromPlugin(plugin)
      : globalThis.navigator?.geolocation

  return {
    create(entity) {
      entity.error ??= null
      entity.isLoading ??= false
      entity.isSupported = Boolean(source())
      entity.isWatching ??= false
      entity.position ??= null
    },

    destroy(entity) {
      unwatch(entity)
    },

    geolocationRequest(entity, options = {}, api) {
      const geolocation = start(entity, api)
      geolocation?.getCurrentPosition(...answers(entity.id, api), options)
    },

    geolocationWatch(entity, options = {}, api) {
      if (watches.has(entity.id)) return
      const geolocation = start(entity, api)
      if (!geolocation) return

      entity.isWatching = true
      watches.set(entity.id, {
        geolocation,
        watch: geolocation.watchPosition(...answers(entity.id, api), options),
      })
    },

    geolocationUnwatch: unwatch,

    geolocationSuccess(entity, position) {
      entity.error = null
      entity.isLoading = false
      entity.position = {
        coords: {
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
        },
        timestamp: position.timestamp,
      }
    },

    geolocationError(entity, error) {
      entity.error = { code: error.code, message: error.message }
      entity.isLoading = false
    },
  }

  function start(entity, api) {
    const geolocation = source()
    entity.isSupported = Boolean(geolocation)
    entity.error = null
    entity.isLoading = Boolean(geolocation)
    if (!geolocation) api.notify(`#${entity.id}:geolocationError`, UNSUPPORTED)
    return geolocation
  }
}

function unwatch(entity) {
  const active = watches.get(entity.id)
  active?.geolocation.clearWatch(active.watch)
  watches.delete(entity.id)
  entity.isLoading = false
  entity.isWatching = false
}

function answers(id, api) {
  return [
    (position) => api.notify(`#${id}:geolocationSuccess`, position),
    (error) => api.notify(`#${id}:geolocationError`, error),
  ]
}

function fromPlugin(plugin) {
  return {
    getCurrentPosition: (onSuccess, onError, options) =>
      plugin.getCurrentPosition(options).then(onSuccess, onError),
    watchPosition: (onSuccess, onError, options) =>
      plugin.watchPosition(options, (position, error) =>
        position ? onSuccess(position) : onError(error),
      ),
    clearWatch: (watch) =>
      Promise.resolve(watch).then((id) => plugin.clearWatch({ id })),
  }
}

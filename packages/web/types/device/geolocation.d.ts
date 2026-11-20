import { Api } from "../mount"

export interface GeolocationCoordinates {
  accuracy: number
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  latitude: number
  longitude: number
  speed: number | null
}

export interface GeolocationEntity {
  error: GeolocationError | null
  id?: string
  isLoading: boolean
  isSupported: boolean
  isWatching: boolean
  position: GeolocationPosition | null
  type: string
}

export interface GeolocationError {
  code: number
  message: string
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  maximumAge?: number
  timeout?: number
}

export interface GeolocationPosition {
  coords: GeolocationCoordinates
  timestamp: number
}

export type GeolocationType = {
  create(entity: GeolocationEntity): void
  destroy(entity: GeolocationEntity): void
  geolocationRequest(
    entity: GeolocationEntity,
    options: GeolocationOptions | undefined,
    api: Api,
  ): void
  geolocationWatch(
    entity: GeolocationEntity,
    options: GeolocationOptions | undefined,
    api: Api,
  ): void
  geolocationUnwatch(entity: GeolocationEntity): void
  geolocationSuccess(
    entity: GeolocationEntity,
    position: GeolocationPosition | PluginPosition,
  ): void
  geolocationError(entity: GeolocationEntity, error: GeolocationError): void
}

/**
 * A position as a plugin may report it: the optional readings can be missing
 * altogether, as `@capacitor/geolocation` leaves them. The entity stores them
 * as `null`.
 */
export interface PluginPosition {
  coords: {
    accuracy: number
    altitude?: number | null
    altitudeAccuracy?: number | null
    heading?: number | null
    latitude: number
    longitude: number
    speed?: number | null
  }
  timestamp: number
}

/** What `createGeolocation` needs of `Geolocation` from `@capacitor/geolocation`. */
export interface GeolocationPlugin {
  getCurrentPosition(options?: GeolocationOptions): Promise<PluginPosition>
  watchPosition(
    options: GeolocationOptions,
    callback: (position: PluginPosition | null, error?: unknown) => void,
  ): Promise<string>
  clearWatch(options: { id: string }): Promise<void>
}

/**
 * The type behind a position: `navigator.geolocation`, or the Capacitor
 * plugin in a native app.
 */
export declare function createGeolocation(config?: {
  plugin?: GeolocationPlugin
}): GeolocationType

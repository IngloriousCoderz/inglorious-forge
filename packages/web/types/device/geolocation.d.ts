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
    position: GeolocationPosition,
  ): void
  geolocationError(entity: GeolocationEntity, error: GeolocationError): void
}

/** What `createGeolocation` needs of `Geolocation` from `@capacitor/geolocation`. */
export interface GeolocationPlugin {
  getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationPosition>
  watchPosition(
    options: GeolocationOptions,
    callback: (position: GeolocationPosition | null, error?: unknown) => void,
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

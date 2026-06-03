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
  id: string | number
  isLoading: boolean
  isSupported: boolean
  isWatching: boolean
  position: GeolocationPosition | null
  type?: "Geolocation"
  watchId: number | null
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

export interface GeolocationType {
  unwatch(entity: GeolocationEntity): void
  create(entity: GeolocationEntity): void
  destroy(entity: GeolocationEntity): void
  error(entity: GeolocationEntity, error: GeolocationError): void
  request(
    entity: GeolocationEntity,
    options: GeolocationOptions | undefined,
    api: { notify: (event: string, payload?: unknown) => void },
  ): void
  success(entity: GeolocationEntity, position: GeolocationPosition): void
  watch(
    entity: GeolocationEntity,
    options: GeolocationOptions | undefined,
    api: { notify: (event: string, payload?: unknown) => void },
  ): void
}

export declare const Geolocation: GeolocationType

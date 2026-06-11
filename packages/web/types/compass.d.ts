import { Api } from "./mount"

export interface CompassEntity {
  id: string | number
  type?: "Compass"
  error: CompassError | null
  heading: number | null
  isCompassActive: boolean
  isCompassPermissionGranted: boolean
  isLoading: boolean
  isSupported: boolean
  manualOffset: number | null
  _absoluteListener: ((event: DeviceOrientationEvent) => void) | null
  _orientationListener: ((event: DeviceOrientationEvent) => void) | null
  _isUsingAbsolute: boolean
  compassTimeout: number | null
}

export interface CompassError {
  code: number
  message: string
}

export interface CompassType {
  create(entity: CompassEntity, payload: unknown, api: Api): void
  destroy(entity: CompassEntity, payload: unknown, api: Api): void
  compassUnwatch(entity: CompassEntity, payload: unknown, api: Api): void
  compassError(entity: CompassEntity, error: CompassError, api: Api): void
  compassPermissionsRequest(
    entity: CompassEntity,
    payload: unknown,
    api: Api,
  ): void
  compassPermissionsGrant(
    entity: CompassEntity,
    payload: unknown,
    api: Api,
  ): void
  compassWatch(entity: CompassEntity, payload: unknown, api: Api): void
  compassActiveChange(entity: CompassEntity, value: boolean, api: Api): void
  compassHeadingChange(entity: CompassEntity, value: number, api: Api): void
}

export declare const Compass: CompassType

import { Api } from "./mount"

export interface ViewportEntity {
  height: number | null
  id: string | number
  isSupported: boolean
  isWatching: boolean
  type?: "Viewport"
  width: number | null
  _listener?: unknown
}

export interface ViewportSize {
  height: number
  width: number
}

export interface ViewportType {
  create(entity: ViewportEntity, payload: unknown, api: Api): void
  destroy(entity: ViewportEntity): void
  viewportChange(entity: ViewportEntity, size: ViewportSize): void
  viewportWatch(entity: ViewportEntity, payload: unknown, api: Api): void
  viewportUnwatch(entity: ViewportEntity): void
}

export declare const Viewport: ViewportType

import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Entity, Handler, UpdateHandler } from "../index"

export interface CameraParams {
  zoom?: number
  /** How much of the way to the target zoom it goes each frame. Defaults to 0.1. */
  zoomSpeed?: number
  zoomSensitivity?: number
  minZoom?: number
  maxZoom?: number
  /** The entity it follows. */
  targetId?: string | null
}

export interface CameraEntity extends Entity, CameraParams {
  position: Vector3
  /** The camera the renderer looks through. */
  isActive?: boolean
  targetZoom?: number
  baseSize?: Vector3
}

/** Follows `targetId` and zooms with the mouse wheel. */
export function camera(params?: CameraParams): {
  create: Handler<CameraEntity>
  update: UpdateHandler<CameraEntity>
  mouseWheel: Handler<CameraEntity, number>
}

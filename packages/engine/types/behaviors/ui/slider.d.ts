import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Decorator, Entity, Handler } from "../../index"

export interface SliderBounds {
  /** Defaults to 0. */
  min?: number
  /** Defaults to 1. */
  max?: number
  /** Defaults to 0, any value. */
  step?: number
}

export interface SliderEntity extends Entity, SliderBounds {
  position: Vector3
  value?: number
  isDragging?: boolean
}

/** Follows the pointer while pressed, and notifies `valueChange` with `{ entityId, value }`. */
export function slider(bounds?: SliderBounds): Decorator<{
  create: Handler<SliderEntity, unknown>
  entityPress: Handler<SliderEntity, string>
  mouseMove: Handler<SliderEntity, Vector3>
  entityRelease: Handler<SliderEntity, string>
}>

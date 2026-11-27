import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Decorator, Entity, Handler, UpdateHandler } from "../../index"

export interface ClampedParams {
  /** The collision group whose shape is kept inside. Defaults to `"bounds"`. */
  collisionGroup?: string
  /** The axis a circle's depth is on. Defaults to `"y"`. */
  depthAxis?: "y" | "z"
}

export interface ClampedEntity extends Entity {
  position: Vector3
}

/** Keeps the entity inside the game's size. */
export function clamped(params?: ClampedParams): Decorator<{
  create: Handler<ClampedEntity, unknown>
  update: UpdateHandler<ClampedEntity>
}>

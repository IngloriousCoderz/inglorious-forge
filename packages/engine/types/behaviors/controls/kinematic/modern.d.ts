import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Decorator, Handler, UpdateHandler } from "../../../index"
import type { MovementHandlers, MovingEntity } from "../event-handlers"

export interface ModernVelocityParams {
  /** Defaults to 250. */
  maxSpeed?: number
}

export interface ModernVelocityEntity extends MovingEntity {
  position: Vector3
  maxSpeed?: number
}

type ModernActions =
  | "moveLeft"
  | "moveRight"
  | "moveUp"
  | "moveDown"
  | "moveLeftRight"
  | "moveUpDown"

export type ModernVelocityHandlers = MovementHandlers<ModernActions> & {
  create: Handler<ModernVelocityEntity, unknown>
  update: UpdateHandler<ModernVelocityEntity>
}

/** Sets the velocity from the arrows or a stick, in screen directions. */
export function modernVelocity(
  params?: ModernVelocityParams,
): Decorator<ModernVelocityHandlers>

/** Moves with the velocity `modernVelocity` sets. */
export function modernControls(
  params?: ModernVelocityParams,
): Decorator<ModernVelocityHandlers>

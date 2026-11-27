import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Decorator, Handler, UpdateHandler } from "../../../index"
import type { MovementHandlers, MovingEntity } from "../event-handlers"

export interface ModernAccelerationParams {
  /** Defaults to 500. */
  maxAcceleration?: number
}

export interface ModernAccelerationEntity extends MovingEntity {
  position: Vector3
  maxAcceleration?: number
  maxSpeed?: number
  friction?: number
}

type ModernActions =
  | "moveLeft"
  | "moveRight"
  | "moveUp"
  | "moveDown"
  | "moveLeftRight"
  | "moveUpDown"

export type ModernAccelerationHandlers = MovementHandlers<ModernActions> & {
  create: Handler<ModernAccelerationEntity, unknown>
  update: UpdateHandler<ModernAccelerationEntity>
}

/** Sets the acceleration from the arrows or a stick, in screen directions. */
export function modernAcceleration(
  params?: ModernAccelerationParams,
): Decorator<ModernAccelerationHandlers>

/** Accelerates with what `modernAcceleration` sets. */
export function modernControls(
  params?: ModernAccelerationParams,
): Decorator<ModernAccelerationHandlers>

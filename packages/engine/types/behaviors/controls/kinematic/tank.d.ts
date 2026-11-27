import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Decorator, Handler, UpdateHandler } from "../../../index"
import type { MovementHandlers, MovingEntity } from "../event-handlers"

export interface TankParams {
  /** Defaults to 250. */
  maxSpeed?: number
  /** Radians a second. Defaults to 10. */
  maxAngularSpeed?: number
}

export interface TankEntity extends MovingEntity {
  position: Vector3
  orientation?: number
  maxSpeed?: number
  maxAngularSpeed?: number
}

type TankActions =
  | "turnLeft"
  | "turnRight"
  | "moveForward"
  | "moveBackward"
  | "strafe"
  | "move"
  | "turn"

/** Turns left and right, and moves forward and backward from where it faces. */
export function tankControls(params?: TankParams): Decorator<
  MovementHandlers<TankActions> & {
    create: Handler<TankEntity, unknown>
    update: UpdateHandler<TankEntity>
  }
>

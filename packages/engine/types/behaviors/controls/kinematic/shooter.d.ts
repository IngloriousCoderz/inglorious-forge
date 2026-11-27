import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Decorator, Handler, UpdateHandler } from "../../../index"
import type { MovementHandlers, MovingEntity } from "../event-handlers"

export interface ShooterParams {
  /** Defaults to 250. */
  maxSpeed?: number
  /** Radians a second. Defaults to a full turn. */
  maxAngularSpeed?: number
}

export interface ShooterEntity extends MovingEntity {
  position: Vector3
  orientation?: number
  maxSpeed?: number
  maxAngularSpeed?: number
}

type ShooterActions =
  "moveLeft" | "moveRight" | "moveUp" | "moveDown" | "move" | "strafe" | "turn"

/** Moves relative to where it faces, and faces the `mouse` entity. */
export function shooterControls(params?: ShooterParams): Decorator<
  MovementHandlers<ShooterActions> & {
    create: Handler<ShooterEntity, unknown>
    update: UpdateHandler<ShooterEntity>
  }
>

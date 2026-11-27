import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Decorator, Entity, Handler, UpdateHandler } from "../../index"

export interface JumpableParams {
  /** Defaults to 250. */
  maxSpeed?: number
  /** How high a jump goes. Defaults to 100. */
  maxJump?: number
  /** How far a jump goes. Defaults to 100. */
  maxLeap?: number
  /** Jumps before it has to land again. Defaults to 1. */
  maxJumps?: number
}

export interface JumpableEntity extends Entity, JumpableParams {
  position: Vector3
  size: Vector3
  velocity?: Vector3
  vy?: number
  jumpsLeft?: number
  /** What it stands on. */
  groundObject?: Entity
}

/**
 * Jumps on `jump`, falls, and stands on anything in the `platform` collision
 * group, notifying `land` when it does.
 */
export function jumpable(params?: JumpableParams): Decorator<{
  create: Handler<JumpableEntity, unknown>
  jump: Handler<JumpableEntity, unknown>
  update: UpdateHandler<JumpableEntity>
}>

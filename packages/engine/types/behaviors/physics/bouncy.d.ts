import type { Decorator, Entity, Handler } from "../../index"

export interface BouncyParams {
  /** How much of a full jump it bounces back up. Defaults to 1. */
  bounciness?: number
}

export interface BouncyEntity extends Entity, BouncyParams {
  maxJump?: number
  maxLeap?: number
  maxSpeed?: number
  vy?: number
  groundObject?: Entity
}

/** Bounces back up when `jumpable` says the entity landed. */
export function bouncy(params?: BouncyParams): Decorator<{
  create: Handler<BouncyEntity, unknown>
  land: Handler<BouncyEntity, { entityId: string; targetId: string }>
}>

import type { Collision, Entity } from "../index"

/**
 * The first of `entities` that collides with `entity` in `collisionGroup`,
 * nearest first. Defaults to the `hitbox` group.
 */
export function findCollision<TTarget extends Entity>(
  entity: Entity,
  entities: Record<string, TTarget>,
  collisionGroup?: string,
): TTarget | undefined

/** Whether two entities collide in `collisionGroup`. */
export function collidesWith(
  entity: Entity,
  target: Entity,
  collisionGroup?: string,
): boolean

/** Whether a hitmask collides with an entity: `false` for every other shape. */
export function findCollisions(
  entity: Entity,
  target: Entity,
  collisionGroup?: string,
): boolean

/** The collision an entity has in a group: its own, or its size if it is `solid`. */
export function collisionGroupOf(
  entity: Entity,
  collisionGroup: string,
): Collision | null

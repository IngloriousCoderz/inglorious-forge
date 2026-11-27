import type { Entity } from "../index"

/** The height an entity's position must be at to stand on top of `target`. */
export function calculateLandingPosition(
  entity: Entity,
  target: Entity,
  collisionGroup?: string,
): number

import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Entity } from "../index"

/** The world's width and depth. */
type Bounds = readonly number[]

/** Moves at `maxSpeed` along the orientation, turning back at the bounds. */
export function bounce(
  entity: Entity & { position: Vector3; maxSpeed: number; orientation: number },
  dt: number,
  bounds: Bounds,
): { velocity: Vector3; position: Vector3; orientation: number }

/** The position that keeps the entity's shape in `collisionGroup` inside the bounds. */
export function clampToBounds(
  entity: Entity & { position: Vector3 },
  bounds: Bounds,
  collisionGroup?: string,
  depthAxis?: "y" | "z",
): Vector3

/** Turns the entity back, and stops it, when its `bounds` shape leaves the bounds. */
export function flip(
  entity: Entity & { position: Vector3; orientation: number },
  bounds: Bounds,
): void

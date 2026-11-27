import type { Vector3 } from "@inglorious/utils/vector.js"

/** Moves with the velocity turned to the orientation, capped at `maxSpeed`. */
export function tankMove(
  entity: {
    position: Vector3
    velocity?: Vector3
    maxSpeed?: number
    orientation?: number
  },
  dt: number,
): { velocity: Vector3; position: Vector3; orientation: number }

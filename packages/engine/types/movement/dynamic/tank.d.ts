import type { Vector3 } from "@inglorious/utils/vector.js"

/** Accelerates with the acceleration turned to the orientation, with friction. */
export function tankMove(
  entity: {
    position: Vector3
    velocity?: Vector3
    acceleration?: Vector3
    maxAcceleration?: number
    maxSpeed?: number
    friction?: number
    orientation?: number
  },
  dt: number,
): { velocity: Vector3; position: Vector3; orientation: number }

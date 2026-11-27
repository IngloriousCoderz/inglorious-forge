import type { Vector3 } from "@inglorious/utils/vector.js"

/** Accelerates, capped at `maxAcceleration` and `maxSpeed`, and faces where it goes. */
export function modernMove(
  entity: {
    position: Vector3
    velocity?: Vector3
    acceleration?: Vector3
    maxAcceleration: number
    maxSpeed: number
    friction?: number
    orientation?: number
  },
  dt: number,
): {
  acceleration: Vector3
  velocity: Vector3
  position: Vector3
  orientation: number
}

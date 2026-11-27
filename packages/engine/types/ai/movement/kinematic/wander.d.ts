import type { Kinematic, KinematicMovement } from "../../../index"

/** Moves at `maxSpeed`, turning a random amount up to `maxAngularSpeed` each step. */
export function wander(entity: Kinematic, dt: number): KinematicMovement

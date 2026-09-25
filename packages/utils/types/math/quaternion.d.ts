import type { Vector, Vector3 } from "./vector"

/** A quaternion represented as a four-dimensional vector. */
export type Quaternion = Vector<readonly [number, number, number, number]>

/** Creates a quaternion for a rotation around an axis. */
export function quaternion(angle?: number, axis?: Vector3): Quaternion

import type { Vector, Vector3 } from "./vectors"

/** A quaternion represented as a four-dimensional vector. */
export type Quaternion = Vector<readonly [number, number, number, number]>

/** Combines two quaternions with the Hamilton product. */
export function combine(q1: Quaternion, q2: Quaternion): Quaternion

/** Creates a quaternion for a rotation around an axis. */
export function quaternion(angle?: number, axis?: Vector3): Quaternion

import type { Quaternion } from "./quaternion"

/** Combines two quaternions with the Hamilton product. */
export function combine(q1: Quaternion, q2: Quaternion): Quaternion

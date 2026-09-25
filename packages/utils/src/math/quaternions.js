/**
 * @typedef {import("../../types/math/quaternion").Quaternion} Quaternion
 */

import { v } from "../v.js"
import { times } from "./vector.js"
import { cross, dot, sum } from "./vectors.js"

/**
 * Combines two quaternions using the Hamilton product.
 * @param {Quaternion} q1 - The first quaternion.
 * @param {Quaternion} q2 - The second quaternion.
 * @returns {Quaternion} - The resulting quaternion after combining q1 and q2.
 */
export function combine(q1, q2) {
  const [s1, ...v1] = q1
  const [s2, ...v2] = q2

  return v(
    s1 * s2 - dot(v1, v2),
    ...sum(times(v2, s1), times(v1, s2), cross(v1, v2)),
  )
}

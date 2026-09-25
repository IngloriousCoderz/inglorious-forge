import type { Vector } from "./math/vector"

/**
 * Ensures that a given value is a vector.
 *
 * If the value is an array of finite numbers but not already a vector (i.e., it lacks the `__isVector__` property),
 * this function converts it into a vector by calling `v()`. If the value is already a vector or not a numeric array,
 * it is returned unchanged. This is particularly useful for ensuring that the results of standard array operations
 * (like `.map()` or `.filter()`) which return a new array are correctly re-tagged as vectors.
 *
 * @template T
 * @param {T} value The value to check and potentially convert.
 * @returns {T extends number[] ? Vector : T} The value as a vector, or the original value if no conversion was needed.
 */
export function ensureV<T>(
  value: T,
): T extends readonly number[] ? Vector<T> : T

/**
 * A utility function to create a vector from a list of coordinates.
 * This is a shorthand for `[x, y, z, ...]`.
 * It also tags the array with a non-enumerable `__isVector__` property for
 * efficient type checking.
 * @param {...number} coords - The coordinates of the vector.
 * @returns {Vector} The created vector.
 */
export function v<Coordinates extends number[]>(
  ...coords: Coordinates
): Vector<Coordinates>

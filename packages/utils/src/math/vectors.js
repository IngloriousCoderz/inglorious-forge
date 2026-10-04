/**
 * @typedef {import("../../types/math/vectors").Vector} Vector
 * @typedef {import("../../types/math/vectors").Vector2} Vector2
 * @typedef {import("../../types/math/vectors").Vector3} Vector3
 * @typedef {import("../../types/math/vectors").Vector7} Vector7
 */

import { v } from "../v.js"
import {
  abs as nAbs,
  clamp as nClamp,
  mod as nMod,
  snap as nSnap,
} from "./numbers.js"
import { quaternion } from "./quaternions.js"
import { random } from "./rng.js"
import { hypothenuse } from "./triangle.js"
import { atan2, cos, sin } from "./trigonometry.js"

/**
 * The vector with every component at zero. Useful for naming the components you
 * care about, and for building a vector up from scratch:
 *
 *     const [, NO_RISE, NO_DEPTH] = ZERO_VECTOR
 *     const position = v(10, 20, NO_DEPTH)
 *
 * Vectors are mutable arrays, so copy it rather than storing it where something
 * writes to one, such as an entity position. Copy it with `v(...ZERO_VECTOR)`,
 * since a plain spread drops the tag `isVector` looks for.
 */
export const ZERO_VECTOR = v(0, 0, 0) // eslint-disable-line no-magic-numbers

/**
 * The vector one unit long along the x axis. Useful for facing a direction, as
 * in `rotate(UNIT_VECTOR, angle)`.
 *
 * As with `ZERO_VECTOR`, copy it with `v(...UNIT_VECTOR)` before storing it.
 */
export const UNIT_VECTOR = v(1, 0, 0) // eslint-disable-line no-magic-numbers

const X = 0
const Y = 1
const Z = 2
const LAST_COORDINATE = 1
const TWO_COORDINATES = 2
const NO_Y = 0
const NO_COMPONENT = 0
const DEFAULT_PRECISION = 1
const DEFAULT_DECIMALS = 0

/**
 * Returns the absolute value of each component in the vector.
 * @param {Vector} vector - The input vector.
 * @returns {Vector} The vector with absolute values.
 */
export function abs(vector) {
  return v(...vector.map(nAbs))
}

/**
 * Alias for the sum function.
 * @type {typeof sum}
 */
export const add = sum

/**
 * Calculates the angle of the vector in radians.
 * @param {Vector} vector - The input vector.
 * @returns {number} The angle of the vector in the XZ plane (for 3D) or XY plane (for 2D), in radians.
 */
export function angle(vector) {
  return atan2(vector[vector.length - LAST_COORDINATE], vector[X])
}

/**
 * Clamps the magnitude of the vector between the given min and max values.
 * @param {Vector} vector - The input vector.
 * @param {number|Vector} min - The minimum magnitude or a vector representing the lower bounds for each component.
 * @param {number|Vector} max - The maximum magnitude or a vector representing the upper bounds for each component.
 * @returns {Vector} The clamped vector.
 */
export function clamp(vector, min, max) {
  const length = magnitude(vector)

  if (typeof min === "number" && length < min) {
    return setMagnitude(vector, min)
  }

  if (typeof max === "number" && length > max) {
    return setMagnitude(vector, max)
  }

  if (typeof min !== "number" && typeof max !== "number") {
    return v(
      ...vector.map((coordinate, index) =>
        nClamp(coordinate, min[index], max[index]),
      ),
    )
  }

  return vector
}

/**
 * Returns the conjugate of the vector.
 * @param {Vector} vector - The input vector.
 * @returns {Vector} The conjugated vector.
 */
export function conjugate(vector) {
  return v(
    ...vector.map((coordinate, index) => (index ? -coordinate : coordinate)),
  )
}

/**
 * Creates a 3D vector with the given magnitude and angle.
 * @param {number} magnitude - The magnitude of the vector.
 * @param {number} angle - The angle of the vector in radians.
 * @returns {Vector3} The created 3D vector.
 */
export function createVector(magnitude, angle) {
  return scale(fromAngle(angle), magnitude)
}

/**
 * Computes the cross product of multiple vectors.
 * @param {...Vector3 | Vector7} vectors - The vectors to compute the cross product for.
 * @returns {Vector3 | Vector7} The resulting vector after the cross product.
 */
export function cross(...vectors) {
  return v(...vectors.reduce(crossMultiplyCoordinates))
}

/**
 * Computes the distance between multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to compute the distance between.
 * @returns {number} The distance between the vectors.
 */
export function distance(...vectors) {
  return magnitude(subtract(...vectors))
}

/**
 * Computes the component-wise division of vectors. A scalar operand is applied
 * to every component.
 * @param {...(Vector2 | Vector3 | number)} operands - The vectors to divide, or a scalar to divide each component by.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
export function divide(...operands) {
  return v(...operands.reduce(divideCoordinates))
}

/**
 * Divides a scalar by each component of the vector.
 * @param {number} scalar - The dividend.
 * @param {Vector} vector - The divisor vector.
 * @returns {Vector} The resulting vector.
 */
export function divideBy(scalar, vector) {
  return v(...vector.map((coordinate) => scalar / coordinate))
}

/**
 * Computes the dot product of multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to compute the dot product for.
 * @returns {number} The resulting scalar value of the dot product.
 */
export function dot(...vectors) {
  return vectors
    .reduce(dotMultiplyCoordinates)
    .reduce((coord1, coord2) => coord1 + coord2)
}

/**
 * Converts a 2D vector [x, z] into a 3D vector [x, 0, z].
 * @param {Vector2} vector - A 2D vector represented as [x, z].
 * @returns {Vector3} A 3D vector represented as [x, 0, z].
 */
export function from2D(vector) {
  const [x, z] = vector
  return v(x, NO_Y, z)
}

/**
 * Creates a 3D unit vector from the given angle in the XZ plane.
 * @param {number} angle - The angle in radians.
 * @returns {Vector3} The unit vector.
 */
export function fromAngle(angle) {
  return rotate(UNIT_VECTOR, angle)
}

/**
 * Alias for the multiply function.
 * @type {typeof multiply}
 */
export const hadamard = multiply

/**
 * Checks if a value is a vector.
 * This is determined by checking for the `__isVector__` property, which is
 * added by the `v()` factory function for efficient type checking.
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is a vector, false otherwise.
 */
export function isVector(value) {
  return !!value?.__isVector__
}

/**
 * Calculates the magnitude (length) of the vector.
 * @param {Vector} vector - The input vector.
 * @returns {number} The magnitude of the vector.
 */
export function magnitude(vector) {
  return hypothenuse(...vector)
}

export const length = magnitude

/**
 * Computes the component-wise modulus of vectors. A scalar operand is applied
 * to every component.
 * @param {...(Vector2 | Vector3 | number)} operands - The vectors to compute the modulus for, or a scalar divisor for each component.
 * @returns {Vector2 | Vector3} The resulting vector after the modulus.
 */
export function mod(...operands) {
  return v(...operands.reduce(modCoordinates))
}

/**
 * Calculates the modulus of a scalar with each component of the vector.
 * @param {number} scalar - The dividend.
 * @param {Vector} vector - The divisor vector.
 * @returns {Vector} The resulting vector.
 */
export function modOf(scalar, vector) {
  return v(...vector.map((coordinate) => nMod(scalar, coordinate)))
}

/**
 * Computes the component-wise multiplication of vectors. A scalar operand is
 * applied to every component.
 * @param {...(Vector2 | Vector3 | number)} operands - The vectors to multiply, or a scalar to multiply each component by.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
export function multiply(...operands) {
  return v(...operands.reduce(multiplyCoordinates))
}

/**
 * Flips the direction of every component, so that adding the result to a vector
 * gives back the point mirrored through it.
 * @param {Vector} vector - The input vector.
 * @returns {Vector} The negated vector.
 */
export function negate(vector) {
  return v(...vector.map((coordinate) => -coordinate))
}

/**
 * Normalizes the vector to have a magnitude of 1.
 * @param {Vector} vector - The input vector.
 * @returns {Vector} The normalized vector.
 */
export function normalize(vector) {
  const length = magnitude(vector)
  return v(...vector.map((coordinate) => coordinate / length))
}

/**
 * Alias for the power function.
 * @type {typeof power}
 */
export const pow = power

/**
 * Computes the component-wise power of vectors. A scalar operand is applied
 * to every component.
 * @param {...(Vector2 | Vector3 | number)} operands - The vectors to compute the power for, or a scalar exponent for each component.
 * @returns {Vector2 | Vector3} The resulting vector after the power.
 */
export function power(...operands) {
  return v(...operands.reduce(powerCoordinates))
}

/**
 * Raises a scalar to the power of each component of the vector.
 * @param {number} scalar - The base value.
 * @param {Vector} vector - The exponent vector.
 * @returns {Vector} The resulting vector.
 */
export function powerOf(scalar, vector) {
  return v(...vector.map((coordinate) => scalar ** coordinate))
}

/**
 * Draws a random vector, taking each component from its own range: the low end is
 * where that axis starts, the high end where it can reach. This is `random`
 * applied per axis, so it suits ranges that differ by axis, where a single pair of
 * bounds would have to be square.
 *
 * A component whose bounds are the same always comes out equal to them, and either
 * bound may be left out to fall back to zero on that axis.
 *
 * @param {Vector} [low] - Where each axis starts.
 * @param {Vector} [high] - Where each axis can reach.
 * @returns {Vector} The random vector.
 * @example
 * ```js
 * // Debris thrown to the left or right, never up or down.
 * randomVector(v(-15, 0, 0), v(15, 0, 0))
 * ```
 */
export function randomVector(low, high) {
  const [lowX, lowY, lowZ] = low ?? []
  const [highX, highY, highZ] = high ?? []

  return v(
    random(lowX ?? NO_COMPONENT, highX ?? NO_COMPONENT),
    random(lowY ?? NO_COMPONENT, highY ?? NO_COMPONENT),
    random(lowZ ?? NO_COMPONENT, highZ ?? NO_COMPONENT),
  )
}

/**
 * Alias for the mod function.
 * @type {typeof mod}
 */
export const remainder = mod

/**
 * Rotates the vector by the given angle. Handles 2D and 3D vectors.
 * For 3D vectors, rotation is around the Y-axis.
 * @param {Vector} vector - The input vector (2D or 3D).
 * @param {number} angle - The angle in radians.
 * @returns {Vector} The rotated vector.
 */
export function rotate(vector, angle) {
  const is2D = vector.length === TWO_COORDINATES

  const vector3 = is2D ? from2D(vector) : vector

  const result = rotateWithQuaternion(vector3, angle)

  return is2D ? to2D(result) : result
}

/**
 * Alias for the dot product function.
 * @type {typeof dot}
 */
export const scalarProduct = dot

/**
 * Alias for the multiply function.
 * @type {typeof multiply}
 */
export const scale = multiply

/**
 * Sets the angle of the vector in the XZ plane while maintaining its magnitude.
 * @param {Vector} vector - The input vector.
 * @param {number} angle - The new angle in radians.
 * @returns {Vector3} The vector with the updated angle.
 */
export function setAngle(vector, angle) {
  const length = magnitude(vector)
  const [x, z] = toCartesian([length, angle])
  return v(x, NO_Y, z)
}

/**
 * Alias for the setMagnitude function.
 * @type {typeof setMagnitude}
 */
export const setLength = setMagnitude

/**
 * Sets the magnitude of the vector while maintaining its direction.
 * @param {Vector} vector - The input vector.
 * @param {number} length - The new magnitude.
 * @returns {Vector} The vector with the updated magnitude.
 */
export function setMagnitude(vector, length) {
  const normalized = normalize(vector)
  return scale(normalized, length)
}

/**
 * Shifts the components of the vector by the given index.
 * @param {Vector} vector - The input vector.
 * @param {number} index - The index to shift by.
 * @returns {Vector} The shifted vector.
 */
export function shift(vector, index) {
  return v(...vector.slice(index), ...vector.slice(X, index))
}

/**
 * Snaps each component of the vector to the nearest multiple of the given precision.
 * @param {Vector} vector - The input vector.
 * @param {number} [precision=DEFAULT_PRECISION] - The precision value.
 * @returns {Vector} The snapped vector.
 */
export function snap(vector, precision = DEFAULT_PRECISION) {
  return v(
    ...vector.map((coordinate) => nSnap(coordinate, -precision, precision)),
  )
}

/**
 * Subtracts multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to subtract.
 * @returns {Vector2 | Vector3} The resulting vector after subtraction.
 */
export function subtract(...vectors) {
  return v(...vectors.reduce(subtractCoordinates))
}

/**
 * Sums multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to sum.
 * @returns {Vector2 | Vector3} The resulting vector after summation.
 */
export function sum(...vectors) {
  return v(...vectors.reduce(sumCoordinates))
}

/**
 * Alias for the multiply function.
 * @type {typeof multiply}
 */
export const times = multiply

/**
 * Converts a 3D vector [x, y, z] into a 2D vector [x, z].
 * @param {Vector3} vector - A 3D vector represented as [x, y, z].
 * @returns {Vector2} A 2D vector represented as [x, z].
 */
export function to2D(vector) {
  const [x, , z] = vector
  return v(x, z)
}

/**
 * Converts 2D polar coordinates to 2D Cartesian coordinates.
 * @param {Vector2} vector - The polar coordinates [magnitude, angle].
 * @returns {Vector2} The Cartesian coordinates [x, y].
 */
export function toCartesian([magnitude, angle]) {
  return v(magnitude * cos(angle), magnitude * sin(angle))
}

/**
 * Converts a 3D cartesian vector to cylindrical coordinates.
 * @param {Vector3} vector - The input vector [x, y, z].
 * @returns {Vector3} The cylindrical coordinates [radius, theta, z].
 */
export function toCylindrical(vector) {
  const radius = magnitude(vector)
  const theta = angle(vector)
  return v(radius * cos(theta), radius * sin(theta), vector[Z])
}

/**
 * Converts a 2D cartesian vector to 2D polar coordinates.
 * @param {Vector2} vector - The input vector [x, y].
 * @returns {Vector2} The polar coordinates [magnitude, angle].
 */
export function toPolar(vector) {
  return v(magnitude(vector), angle(vector))
}

/**
 * Converts a vector to a string representation.
 * @param {Vector} vector - The input vector.
 * @param {number} [decimals=DEFAULT_DECIMALS] - The number of decimal places.
 * @returns {string} The string representation of the vector.
 */
export function toString(vector, decimals = DEFAULT_DECIMALS) {
  return `[${vector
    .map((coordinate) => coordinate.toFixed(decimals))
    .join(", ")}]`
}

/**
 * Converts a 3D cartesian vector to spherical coordinates [radius, inclination, azimuth].
 * - radius (r): distance from the origin.
 * - inclination (θ): angle from the Y-axis (0 to PI).
 * - azimuth (φ): angle from the X-axis in the XZ-plane (-PI to PI).
 * @param {Vector3} vector The cartesian vector [x, y, z].
 * @returns {Vector3} The spherical coordinates [r, θ, φ].
 */
export function toSpherical(vector) {
  const r = magnitude(vector)

  if (!r) {
    return zero()
  }

  // In a Y-up system, inclination is the angle with the Y axis.
  const inclination = Math.acos(vector[Y] / r)
  // Azimuth is the angle in the XZ plane, which `angle()` calculates.
  const azimuth = angle(vector)

  return v(r, inclination, azimuth)
}

/**
 * Creates a 3D unit vector in the XZ plane with the given angle.
 * @param {number} [angle=0] - The angle in radians.
 * @returns {Vector3} The unit vector.
 */
export function unit(angle) {
  if (!angle) {
    return v(...UNIT_VECTOR)
  }

  return setAngle(UNIT_VECTOR, angle)
}

/**
 * Alias for the cross product function.
 * @type {typeof cross}
 */
export const vectorProduct = cross

/**
 * Creates a zero vector of 3 dimensions.
 * @returns {Vector3} The zero vector.
 */
export function zero() {
  return v(...ZERO_VECTOR)
}

/**
 * Reads the value at the given index of a vector operand, broadcasting a
 * scalar operand to every index.
 * @param {number | Vector2 | Vector3 | Vector7} operand - A vector or a scalar.
 * @param {number} index - The index of the coordinate to read.
 * @returns {number} The coordinate value.
 */
function broadcast(operand, index) {
  return typeof operand === "number" ? operand : operand[index]
}

/**
 * Computes the cross product of two vectors' coordinates.
 * @param {Vector3} vector1 - The first vector.
 * @param {Vector3} vector2 - The second vector.
 * @returns {Vector3} The resulting vector after the cross product.
 */
function crossMultiplyCoordinates(vector1, vector2) {
  const indexes = Array(vector1.length)
    .fill(null)
    .map((_, index) => index)

  return v(
    ...indexes.map((_, index) => {
      const [index1, index2] = shift(
        indexes.filter((_, i) => i !== index),
        index,
      )
      return (
        vector1[index1] * vector2[index2] - vector1[index2] * vector2[index1]
      )
    }),
  )
}

/**
 * Divides the coordinates of two vectors component-wise. Scalars are broadcast.
 * @param {Vector2 | Vector3} vector1 - The dividend vector.
 * @param {number | Vector2 | Vector3} vector2 - The divisor vector or scalar.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function divideCoordinates(vector1, vector2) {
  return v(
    ...vector1.map(
      (coordinate, index) => coordinate / broadcast(vector2, index),
    ),
  )
}

/**
 * Multiplies the coordinates of two vectors component-wise. Scalars are broadcast.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {number | Vector2 | Vector3} vector2 - The second vector or scalar.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function dotMultiplyCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate * vector2[index]))
}

/**
 * Computes the component-wise modulus of two vectors. Scalars are broadcast.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {number | Vector2 | Vector3} vector2 - The second vector or scalar.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function modCoordinates(vector1, vector2) {
  return v(
    ...vector1.map((coordinate, index) =>
      nMod(coordinate, broadcast(vector2, index)),
    ),
  )
}

/**
 * Multiplies the coordinates of two vectors component-wise. Scalars are broadcast.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {number | Vector2 | Vector3} vector2 - The second vector or scalar.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function multiplyCoordinates(vector1, vector2) {
  return v(
    ...vector1.map(
      (coordinate, index) => coordinate * broadcast(vector2, index),
    ),
  )
}

/**
 * Raises the coordinates of the first vector to the power of the second vector's coordinates. Scalars are broadcast.
 * @param {Vector2 | Vector3} vector1 - The base vector.
 * @param {number | Vector2 | Vector3} vector2 - The exponent vector or scalar.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function powerCoordinates(vector1, vector2) {
  return v(
    ...vector1.map(
      (coordinate, index) => coordinate ** broadcast(vector2, index),
    ),
  )
}

/**
 * Subtracts the coordinates of two vectors.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {Vector2 | Vector3} vector2 - The second vector.
 * @returns {Vector2 | Vector3} The resulting vector after subtraction.
 */
function subtractCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate - vector2[index]))
}

/**
 * Adds the coordinates of two vectors.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {Vector2 | Vector3} vector2 - The second vector.
 * @returns {Vector2 | Vector3} The resulting vector after addition.
 */
function sumCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate + vector2[index]))
}

/**
 * Rotates a 3D vector around the Y-axis using a quaternion.
 * @param {Vector3} vector - The input vector.
 * @param {number} angle - The angle in radians.
 * @returns {Vector3} The rotated vector.
 */
function rotateWithQuaternion(vector, angle) {
  if (!angle) {
    return vector
  }

  // @see https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation#Performance_comparisons
  const [w, ...r] = quaternion(angle)
  const result = sum(
    vector,
    cross(scale(r, 2), sum(cross(r, vector), scale(vector, w))), // eslint-disable-line no-magic-numbers
  )

  return conjugate(result) // HACK: not really sure why I should invert the result, it just works this way
}

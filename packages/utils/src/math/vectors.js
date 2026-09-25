/**
 * @typedef {import("../../types/math/vector").Vector2} Vector2
 * @typedef {import("../../types/math/vector").Vector3} Vector3
 * @typedef {import("../../types/math/vector").Vector7} Vector7
 */

import { v } from "../v.js"
import { mod as nMod } from "./numbers.js"
import { magnitude, shift } from "./vector.js"

/**
 * Alias for the sum function.
 * @type {typeof sum}
 */
export const add = sum

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
 * Computes the component-wise division of multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to divide.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
export function divide(...vectors) {
  return v(...vectors.reduce(divideCoordinates))
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
 * Alias for the multiply function.
 * @type {typeof multiply}
 */
export const hadamard = multiply

/**
 * Computes the component-wise modulus of multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to compute the modulus for.
 * @returns {Vector2 | Vector3} The resulting vector after the modulus.
 */
export function mod(...vectors) {
  return v(...vectors.reduce(modCoordinates))
}

/**
 * Computes the component-wise multiplication of multiple vectors (Hadamard product).
 * @param {...Vector2 | Vector3} vectors - The vectors to multiply.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
export function multiply(...vectors) {
  return v(...vectors.reduce(multiplyCoordinates))
}

/**
 * Computes the component-wise power of multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to compute the power for.
 * @returns {Vector2 | Vector3} The resulting vector after the power.
 */
export function power(...vectors) {
  return v(...vectors.reduce(powerCoordinates))
}

/**
 * Alias for the dot product function.
 * @type {typeof dot}
 */
export const scalarProduct = dot

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
 * Alias for the cross product function.
 * @type {typeof cross}
 */
export const vectorProduct = cross

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
 * Subtracts the coordinates of two vectors.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {Vector2 | Vector3} vector2 - The second vector.
 * @returns {Vector2 | Vector3} The resulting vector after subtraction.
 */
function subtractCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate - vector2[index]))
}

/**
 * Divides the coordinates of two vectors component-wise.
 * @param {Vector2 | Vector3} vector1 - The dividend vector.
 * @param {Vector2 | Vector3} vector2 - The divisor vector.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function divideCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate / vector2[index]))
}

/**
 * Computes the component-wise modulus of two vectors.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {Vector2 | Vector3} vector2 - The second vector.
 * @returns {Vector2 | Vector3} The resulting vector after the modulus.
 */
function modCoordinates(vector1, vector2) {
  return v(
    ...vector1.map((coordinate, index) => nMod(coordinate, vector2[index])),
  )
}

/**
 * Multiplies the coordinates of two vectors component-wise.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {Vector2 | Vector3} vector2 - The second vector.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function multiplyCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate * vector2[index]))
}

/**
 * Raises the coordinates of the first vector to the power of the second vector's coordinates.
 * @param {Vector2 | Vector3} vector1 - The base vector.
 * @param {Vector2 | Vector3} vector2 - The exponent vector.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function powerCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate ** vector2[index]))
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
 * Multiplies the coordinates of two vectors.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {Vector2 | Vector3} vector2 - The second vector.
 * @returns {Vector2 | Vector3} The resulting vector containing multiplied coordinates.
 */
function dotMultiplyCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate * vector2[index]))
}

const DEFAULT_PRECISION = 1 // Default precision used for snapping numbers.
const DEFAULT_TOLERANCE = 0.1 // Default tolerance used for comparing numbers.
const SQUARE_ROOT = 0.5 // Exponent used for calculating square roots.

/**
 * Returns the absolute value of a number.
 * @param {number} num - The number to get the absolute value of.
 * @returns {number} The absolute value of the input number.
 */
export function abs(num) {
  return Math.abs(num)
}

/**
 * Clamps a number within the inclusive range specified by min and max.
 * @param {number} num - The number to clamp.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The clamped value.
 */
export function clamp(num, min, max) {
  if (num < min) {
    return min
  }

  if (num > max) {
    return max
  }

  return num
}

/**
 * Checks if a number is between a minimum and maximum value, inclusive.
 * @param {number} num - The number to check.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {boolean} True if the number is between min and max, false otherwise.
 */
export function isBetween(num, min, max) {
  return num >= min && num <= max
}

/**
 * Checks if two numbers are close to each other within a given tolerance.
 * @param {number} num1 - The first number.
 * @param {number} num2 - The second number.
 * @param {number} [tolerance=DEFAULT_TOLERANCE] - The tolerance for comparison.
 * @returns {boolean} True if the numbers are close, false otherwise.
 */
export function isClose(num1, num2, tolerance = DEFAULT_TOLERANCE) {
  return abs(num1 - num2) <= tolerance
}

/**
 * Computes the modulus of two numbers, ensuring a positive result.
 * If the divisor is zero, it returns the dividend to avoid `NaN`.
 * @param {number} dividend - The number to be divided.
 * @param {number} divisor - The number to divide by.
 * @returns {number} The modulus result.
 */
export function mod(dividend, divisor) {
  if (!divisor) {
    return dividend
  }
  return ((dividend % divisor) + divisor) % divisor
}

/**
 * Snaps a number to the nearest multiple of a given precision.
 * @param {number} num - The number to snap.
 * @param {number} [precision=DEFAULT_PRECISION] - The precision to snap to.
 * @returns {number} The snapped value.
 */
export function snap(num, precision = DEFAULT_PRECISION) {
  return Math.round(num / precision) * precision
}

/**
 * Alias for the `mod` function.
 * @type {typeof mod}
 */
export const remainder = mod

/**
 * Returns the sign of a number: 1 for positive, -1 for negative, and 0 for zero.
 * @param {number} num - The number to get the sign of.
 * @returns {number} The sign of the number.
 */
export function sign(num) {
  if (!num) {
    return num
  }

  return num / abs(num)
}

/**
 * Computes the square root of a number.
 * @param {number} num - The number to compute the square root of.
 * @returns {number} The square root of the number.
 */
export function sqrt(num) {
  return num ** SQUARE_ROOT
}

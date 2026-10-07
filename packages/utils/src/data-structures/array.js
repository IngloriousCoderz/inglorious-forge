/**
 * A default comparator function that compares two numbers.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} - A positive number if `a` is less than `b`, a negative number if `a` is greater than `b`, or 0 if they are equal.
 */
const DEFAULT_COMPARATOR = (a, b) => b - a

// Threshold constants for comparison results
const LESS_THAN_ZERO = 0
const GREATER_THAN_ZERO = 0

/**
 * Checks if an array contains a specific item.
 *
 * @param {Array} arr - The array to search.
 * @param {*} item - The item to check for.
 * @returns {boolean} - `true` if the item is found, otherwise `false`.
 */
export function contains(arr, item) {
  return arr.includes(item)
}

/**
 * The index `step` places along a list of `length`, wrapping round at either end.
 *
 * @param {number} index - Where to start from.
 * @param {number} length - How long the list is.
 * @param {number} step - How far to move. Negative steps move backwards.
 * @returns {number} - The index landed on, always within the list.
 */
export function cycleIndex(index, length, step) {
  return (((index + step) % length) + length) % length
}

/**
 * Ensures that the given value is an array. If it's not an array, it wraps it in one.
 *
 * @param {*} value - The value to check.
 * @returns {Array} - The original array or the value wrapped in a new array.
 */
export function ensureArray(value) {
  return isArray(value) ? value : [value]
}

/**
 * Checks if a value is an array.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is an array, false otherwise.
 */
export function isArray(value) {
  return Array.isArray(value)
}

/**
 * Finds the maximum item in an array based on a comparator function.
 *
 * @param {Array} arr - The array to search.
 * @param {Function} [comparator=DEFAULT_COMPARATOR] - The comparator function to determine the maximum item.
 * @returns {*} - The maximum item in the array.
 */
export function max(arr, comparator = DEFAULT_COMPARATOR) {
  return arr.reduce((acc, item) =>
    comparator(item, acc) < LESS_THAN_ZERO ? item : acc,
  )
}

/**
 * Finds the minimum item in an array based on a comparator function.
 *
 * @param {Array} arr - The array to search.
 * @param {Function} [comparator=DEFAULT_COMPARATOR] - The comparator function to determine the minimum item.
 * @returns {*} - The minimum item in the array.
 */
export function min(arr, comparator = DEFAULT_COMPARATOR) {
  return arr.reduce((acc, item) =>
    comparator(item, acc) > GREATER_THAN_ZERO ? item : acc,
  )
}

/**
 * Removes the smallest item from an array, based on a comparator function.
 *
 * @param {Array} arr - The array to remove the item from.
 * @param {Function} [comparator=DEFAULT_COMPARATOR] - The comparator function to determine the smallest item.
 * @returns {*} - A new array with the item removed.
 */
export function pop(arr, comparator = DEFAULT_COMPARATOR) {
  const item = min(arr, comparator)
  return remove(arr, item)
}

/**
 * Adds an item to an array in an immutable way.
 *
 * @param {Array} arr - The array to add the item to.
 * @param {*} item - The item to add.
 * @returns {Array} - A new array with the item added.
 */
export function push(arr, item) {
  return [...arr, item]
}

/**
 * Removes a specific item from an array in an immutable way.
 *
 * @param {Array} arr - The array to remove the item from.
 * @param {*} item - The item to remove.
 * @returns {Array} - A new array with the item removed.
 */
export function remove(arr, item) {
  return arr.filter((el) => el !== item)
}

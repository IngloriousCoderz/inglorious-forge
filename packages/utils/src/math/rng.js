/* eslint-disable no-magic-numbers */

/**
 * Chooses a random value from the given arguments.
 * @param {...*} values - The values to choose from.
 * @returns {*} A randomly selected value.
 */
export function choose(...values) {
  if (!values.length) {
    return undefined
  }
  const index = random(values.length - 1)
  return values[index]
}

/**
 * Generates a random number.
 * - If no arguments are provided, returns a random float between 0 (inclusive) and 1 (exclusive).
 * - If one argument (`to`) is provided, returns a random integer between 0 and `to` (inclusive).
 * - If two arguments (`from`, `to`) are provided:
 *   - If they are integers, returns a random integer between `from` and `to` (inclusive).
 *   - If they are floats, returns a random float between `from` (inclusive) and `to` (exclusive).
 * - If three arguments (`from`, `to`, `step`) are provided, returns a random integer within the specified range and step.
 * @param {number} [to] - The upper bound.
 * @param {number} [from] - The lower bound.
 * @param {number} [step=1] - The step size if two or more arguments are provided.
 * @returns {number} A random number based on the provided arguments.
 */
export function random(...args) {
  if (!args.length) {
    return Math.random()
  }

  // A range with a fractional bound cannot be stepped through as integers, so it
  // is read as a continuous range. Requiring both bounds to be floats used to
  // send `random(0.5, 1)` down the integer path, where it could only ever answer
  // 0 or 1.
  if (
    args.length > 1 &&
    (!Number.isInteger(args[0]) || !Number.isInteger(args[1]))
  ) {
    const [from, to] = args
    return Math.random() * (to - from) + from
  }

  let step, from, to

  if (args.length === 1) {
    step = 1
    from = 0
    to = args[0] + 1
  }

  if (args.length > 1) {
    step = args[2] ?? 1
    from = args[0] / step
    to = (args[1] + 1) / step
  }

  return Math.floor(Math.random() * (to - from) + from) * step
}

/**
 * Generates a random binomial value.
 * The result is the difference between two random numbers.
 * @returns {number} A random binomial value.
 */
export function randomBinomial() {
  return random() - random()
}

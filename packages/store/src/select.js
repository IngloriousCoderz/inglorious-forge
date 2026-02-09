/**
 * @typedef {import('../types/select').InputSelector} InputSelector
 * @typedef {import('../types/select').OutputSelector} OutputSelector
 */

/**
 * Creates a memoized derived computation from one or more input selectors.
 *
 * `compute` returns a function that, given the application state, will:
 * - run each input selector with the state
 * - compare the results with the previous invocation using strict equality
 * - recompute the result only if at least one input has changed
 *
 * This is a simple, explicit memoization utility.
 * There is no dependency tracking, deep comparison, or reactive graph:
 * memoization is based solely on referential equality of selector outputs.
 *
 * @template TState
 * @template TResult
 *
 * @param {(…inputs: any[]) => TResult} resultFunc
 * A function that receives the results of the input selectors and returns
 * the computed value.
 *
 * @param {InputSelector<TState, any>[]} inputSelectors
 * An array of selector functions used to extract inputs from the state (optional).
 *
 * @returns {OutputSelector<TState, TResult>}
 * A memoized function that computes and returns the derived value.
 */
export function compute(resultFunc, inputSelectors = []) {
  let lastInputs
  let lastResult
  let initialized = false

  return (state) => {
    const nextInputs = inputSelectors.map((selector) => selector(state))

    const inputsChanged =
      !initialized ||
      lastInputs.length !== nextInputs.length ||
      nextInputs.some((input, index) => input !== lastInputs[index])

    if (!inputsChanged) {
      return lastResult
    }

    lastInputs = nextInputs
    lastResult = resultFunc(...nextInputs)
    initialized = true
    return lastResult
  }
}

/**
 * Redux-compatible alias for {@link compute}.
 *
 * This function exists for familiarity and migration purposes.
 * Prefer using `compute` directly in new code.
 *
 * @template TState
 * @template TResult
 *
 * @param {InputSelector<TState, any>[]} inputSelectors
 * An array of input selector functions.
 *
 * @param {(…inputs: any[]) => TResult} resultFunc
 * A function that receives the results of the input selectors and returns
 * a computed value.
 *
 * @returns {OutputSelector<TState, TResult>}
 * A memoized selector function.
 */
export function createSelector(inputSelectors, resultFunc) {
  return compute(resultFunc, inputSelectors)
}

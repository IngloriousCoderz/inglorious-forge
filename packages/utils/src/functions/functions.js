const DEFAULT_WAIT = 0

/**
 * Composes multiple functions from right to left, as if every function wraps the next one.
 * The first function (rightmost) can take multiple arguments; the remaining functions must be unary.
 *
 * @param {...Function} fns - Functions to compose.
 * @returns {Function} A function that takes the initial arguments and applies the composed functions.
 */
export function compose(...fns) {
  if (!fns.length) {
    return (x) => x
  }

  const [last, ...rest] = fns.reverse()
  return (...args) => rest.reduce((acc, fn) => fn(acc), last(...args))
}

/**
 * Creates a debounced function that delays invoking `fn` until after `wait`
 * milliseconds have elapsed since the last call.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} [wait=0] - The number of milliseconds to delay.
 * @returns {Function & { cancel: Function, flush: Function, pending: Function }} The debounced function.
 */
export function debounce(fn, wait = DEFAULT_WAIT) {
  let timeoutId
  let lastArgs
  let lastThis
  let result

  function clearPending() {
    lastArgs = undefined
    lastThis = undefined
  }

  function invoke() {
    const args = lastArgs
    const context = lastThis

    clearPending()
    result = fn.apply(context, args)
    return result
  }

  function debounced(...args) {
    lastArgs = args
    lastThis = this

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = undefined
      invoke()
    }, wait)

    return result
  }

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = undefined
    clearPending()
  }

  debounced.flush = () => {
    if (timeoutId === undefined) {
      return result
    }

    clearTimeout(timeoutId)
    timeoutId = undefined
    return invoke()
  }

  debounced.pending = () => timeoutId !== undefined

  return debounced
}

/**
 * Pipes multiple functions from left to right, as if the functions are applied one by one.
 * The first function (leftmost) can take multiple arguments; the remaining functions must be unary.
 *
 * @param {...Function} fns - Functions to pipe.
 * @returns {Function} A function that takes the initial arguments and applies the piped functions.
 */
export function pipe(...fns) {
  if (!fns.length) {
    return (x) => x
  }

  const [first, ...rest] = fns
  return (...args) => rest.reduce((acc, fn) => fn(acc), first(...args))
}

/**
 * Creates a throttled function that invokes `fn` immediately, then ignores
 * calls until `wait` milliseconds have elapsed.
 *
 * @param {Function} fn - The function to throttle.
 * @param {number} [wait=0] - The number of milliseconds to suppress repeated calls.
 * @returns {Function & { cancel: Function, pending: Function }} The throttled function.
 */
export function throttle(fn, wait = DEFAULT_WAIT) {
  let timeoutId
  let result

  function throttled(...args) {
    if (timeoutId !== undefined) {
      return result
    }

    timeoutId = setTimeout(() => {
      timeoutId = undefined
    }, wait)

    result = fn.apply(this, args)
    return result
  }

  throttled.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = undefined
  }

  throttled.pending = () => timeoutId !== undefined

  return throttled
}

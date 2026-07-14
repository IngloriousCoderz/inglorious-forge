const DEFAULT_DELAY = 0

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
 * Creates a debounced function that delays invoking `fn` until after `delay`
 * milliseconds have elapsed since the last call.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} [delay=0] - The number of milliseconds to delay.
 * @returns {Function & { cancel: Function, flush: Function, pending: Function }} The debounced function.
 */
export function debounce(fn, delay = DEFAULT_DELAY) {
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
    }, delay)

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
 * Creates a throttled function that invokes `fn` immediately on the leading
 * edge, then suppresses further calls until `delay` milliseconds have
 * elapsed.
 *
 * By default (`hasTrailing: false`), any calls made while suppressed are
 * dropped entirely — only the leading call's arguments are ever used, and
 * the very last call of a burst may be lost. Pass `{ hasTrailing: true }` to
 * additionally invoke `fn` once more, after `delay` has elapsed, with the
 * arguments from the most recent suppressed call — guaranteeing the final
 * state of a burst is never silently dropped, at the cost of `fn` running
 * again asynchronously after the burst settles.
 *
 * @param {Function} fn - The function to throttle.
 * @param {number} [delay=0] - The number of milliseconds to suppress repeated calls.
 * @param {Object} [options]
 * @param {boolean} [options.hasTrailing=false] - Whether to invoke `fn` once
 *   more after `delay`, using the arguments of the last suppressed call.
 * @returns {Function & { cancel: Function, pending: Function }} The throttled function.
 */
export function throttle(
  fn,
  delay = DEFAULT_DELAY,
  { hasTrailing = false } = {},
) {
  let timeoutId
  let result
  let lastArgs
  let lastThis
  let trailingCallPending = false

  function clearPending() {
    lastArgs = undefined
    lastThis = undefined
    trailingCallPending = false
  }

  function startWindow() {
    timeoutId = setTimeout(() => {
      timeoutId = undefined

      // NOTE: this runs asynchronously, after `delay` has elapsed — so this
      // is the one path where `fn` is not invoked synchronously with the
      // triggering call. Callers that pass draft/proxy objects through `fn`
      // (e.g. a mutative entity) must treat this like a debounced call: only
      // hold onto primitives across the throttle boundary, and re-fetch any
      // live object when `fn` actually runs here.
      if (trailingCallPending) {
        const args = lastArgs
        const context = lastThis
        clearPending()
        result = fn.apply(context, args)
      }
    }, delay)
  }

  function throttled(...args) {
    lastArgs = args
    lastThis = this

    if (timeoutId !== undefined) {
      if (hasTrailing) {
        trailingCallPending = true
      }
      return result
    }

    result = fn.apply(this, args)
    lastArgs = undefined
    lastThis = undefined
    startWindow()
    return result
  }

  throttled.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = undefined
    clearPending()
  }

  throttled.pending = () => timeoutId !== undefined || trailingCallPending

  return throttled
}

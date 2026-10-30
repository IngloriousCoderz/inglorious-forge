const DEFAULT_STATE = "default"
const DEFAULT_VALUE = 0
const COUNTER_RESET = 0

export const Ticker = {
  /**
   * Ticks a counter and calls a function when a target interval is reached.
   *
   * @param {object} options The options for the tick.
   * @param {object} options.target An object to hold the ticker's internal state.
   * @param {number} options.target.speed The interval in milliseconds for the ticker to "tick".
   * @param {number} options.dt The time elapsed since the last tick.
   * @param {function} options.onTick The function to call when the ticker "ticks".
   * @param {string} [options.state="default"] An optional state to track changes and reset the ticker.
   * @param {number} [options.defaultValue=0] The default value for the target's counter.
   */
  tick({ target, state = DEFAULT_STATE, dt, onTick, ...options }) {
    const missing = [target == null && "'target'", dt == null && "'dt'"]
      .filter(Boolean)
      .join(", ")
    if (missing.length) {
      throw new Error(`Ticker.tick is missing mandatory parameters: ${missing}`)
    }

    const { speed, defaultValue = DEFAULT_VALUE } = target

    if (state !== target.animation) {
      target.animation = state
      target.counter = COUNTER_RESET
      target.value = defaultValue
    }

    target.state = state

    target.counter ??= COUNTER_RESET
    target.value ??= defaultValue

    target.counter += dt
    if (target.counter >= speed) {
      target.counter = COUNTER_RESET
      onTick?.(target, dt, options)
    }
  },
}

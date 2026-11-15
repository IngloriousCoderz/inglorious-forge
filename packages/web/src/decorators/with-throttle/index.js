import { throttle } from "@inglorious/utils/functions"

import { toDelays, withLimiter } from "../limit.js"

/**
 * Wraps selected event handlers of a type with throttling, scoped per entity.
 *
 * By default this is leading-edge only: the first call in a burst runs
 * immediately, and further calls are dropped until `delay` has elapsed, so the
 * last call of a burst may be lost. Pass `{ hasTrailing: true }` to also invoke
 * the handler once more after `delay`, with the most recent suppressed call's
 * arguments. Every call that gets through runs the original handler in an
 * update of its own, through the `<handler>Throttled` event.
 *
 * @param {number|Object} config - Either a single delay (ms) applied to all
 *   handlers listed in `handlerNames`, or a map of handlerName -> delay (ms).
 * @param {string[]} [handlerNames] - Handler names to throttle. Required when
 *   `config` is a single number; ignored when `config` is a map (its keys
 *   are used instead).
 * @param {Object} [options]
 * @param {boolean} [options.hasTrailing=false] - Whether throttled handlers
 *   also fire once more after `delay`, with the last suppressed call's arguments.
 *
 * @example
 * // leading-edge only (default)
 * const types = {
 *   ScrollTracker: [Base, withThrottle(200, ["scroll"])],
 * }
 *
 * @example
 * // leading + trailing: never lose the final call of a burst
 * const types = {
 *   ResizablePanel: [Base, withThrottle({ resize: 100 }, undefined, { hasTrailing: true })],
 * }
 */
export function withThrottle(
  config,
  handlerNames,
  { hasTrailing = false } = {},
) {
  return withLimiter(toDelays(config, handlerNames), "Throttled", (fn, delay) =>
    throttle(fn, delay, { hasTrailing }),
  )
}

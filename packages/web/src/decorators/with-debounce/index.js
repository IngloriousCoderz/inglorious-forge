import { debounce } from "@inglorious/utils/functions"

import { toDelays, withLimiter } from "../limit.js"

/**
 * Wraps selected event handlers of a type with debouncing, scoped per entity.
 * When the delay ends, the original handler runs in an update of its own,
 * through the `<handler>Debounced` event.
 *
 * @param {number|Object} config - Either a single delay (ms) applied to all
 *   handlers listed in `handlerNames`, or a map of handlerName -> delay (ms).
 * @param {string[]} [handlerNames] - Handler names to debounce. Required when
 *   `config` is a single number; ignored when `config` is a map (its keys
 *   are used instead).
 *
 * @example
 * // same delay for every listed handler
 * const types = {
 *   AutosaveForm: [Form, withDebounce(500, ["saveData"])],
 * }
 *
 * @example
 * // per-handler delays
 * const types = {
 *   SearchBox: [Combobox, withDebounce({ optionsLoad: 300, saveQuery: 800 })],
 * }
 */
export function withDebounce(config, handlerNames) {
  return withLimiter(toDelays(config, handlerNames), "Debounced", debounce)
}

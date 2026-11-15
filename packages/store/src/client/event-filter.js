/**
 * Whether an event passes a blacklist, a whitelist and a predicate, as the
 * devtools and the multiplayer middleware filter the events they relay.
 *
 * @param {Object} [config]
 * @param {string[]} [config.blacklist] - Event types never relayed.
 * @param {string[]} [config.whitelist] - The only event types relayed, when given.
 * @param {(event: { type: string, payload?: any }) => boolean} [config.filter] - A last say on each event.
 * @returns {(event: { type: string, payload?: any }) => boolean}
 */
export function createEventFilter({
  blacklist = [],
  whitelist = [],
  filter = null,
} = {}) {
  return (event) =>
    (!blacklist.length || !blacklist.includes(event.type)) &&
    (!whitelist.length || whitelist.includes(event.type)) &&
    (!filter || filter(event))
}

/**
 * Says what each state answers to.
 *
 * What a key, an axis or a button means is part of what a state *is*, not something
 * decided once for the whole game: the same key answers one thing on a menu and another in
 * play, and a state with nothing mapped of its own should be deaf rather than quietly
 * carrying on answering whatever the last state set.
 *
 * Each state therefore says what it answers to, in the same place it says what it does.
 * Composed onto the entity running the machine, which is what announces the move.
 *
 * @example
 * ```js
 * const types = {
 *   Game: [
 *     scenes(SCENES),
 *     mappings({
 *       menu: { ArrowUp: "moveItemUp", Btn0: "moveItemUp", Enter: "choose" },
 *       play: { ArrowLeft: "moveLeft", Btn4: "fire" },
 *       // Deaf on purpose: there is nothing to press here.
 *       credits: {},
 *     }),
 *     fsm({ menu: { choose: (e) => { e.state = "play" } }, play: {} }),
 *   ],
 * }
 * ```
 *
 * @param {Object.<string, object>} mappingsByState - What each state answers to.
 * @returns {object} The behaviour.
 */
export function mappings(mappingsByState) {
  function apply(state, api) {
    // A state with no keys of its own is deaf. Falling back to the last mapping instead
    // would make a forgotten state carry on answering, which is the mistake this is
    // written to prevent.
    api.notify("mappingChange", mappingsByState[state] ?? {})
  }

  // Written as a decorator rather than a bare behaviour because behaviours compose by
  // replacing, not by running in order: a type has one `create` and one `stateChange`, and
  // the last behaviour to name one wins. So each handler does its own part and then hands
  // on to whatever it displaced, the way the dynamic behaviours in the recipes do.
  return (type) => ({
    // A machine is already in its first state when it is made, and nothing announces that:
    // it only announces moves. So the opening state would never be given its keys, and the
    // game would begin answering whatever the mapping it was handed happened to be.
    create(entity, payload, api) {
      type.create?.(entity, payload, api)

      apply(entity.state, api)
    },

    stateChange(entity, event, api) {
      type.stateChange?.(entity, event, api)

      apply(event.to, api)
    },
  })
}

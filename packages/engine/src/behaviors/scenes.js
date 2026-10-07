import { isDeepEqual } from "@inglorious/utils/object.js"

import { STATE_CHANGE } from "./fsm.js"

// What a scene is remembered under, so that the next state can be told what it replaced.
const SCENE = "scene"

// A state with nothing in it is a state the machine is merely passing through.
const NOTHING = []

/**
 * Puts an entity up, and takes down whatever the state before it had up.
 *
 * A state machine says when it moves; this says what each state is made of, and is
 * usually the pair to `fsm`. Together they cover the ordinary case of a game that is a
 * few screens and a world that survives the move between them -- a menu has nothing on it
 * that the play has, and two states of the same play have all of it in common.
 *
 * Only the difference between two states is touched. Anything they have in common is
 * left standing as it is, which is what carries whatever the two share from one into the
 * next without rebuilding it, and so without losing whatever the world has already done
 * to it.
 *
 * A thing that stands on both sides but is not configured the same way is patched rather
 * than rebuilt, so one state may take over part of it -- a keyboard whose keys mean
 * something else there -- without the rest of it being torn up to make room.
 *
 * @example
 * ```js
 * import { scenes } from "@inglorious/engine/behaviors/scenes.js"
 * import { fsm } from "@inglorious/engine/behaviors/fsm.js"
 *
 * const SCENES = {
 *   title: () => [createTitleEntity(), createMenuEntity()],
 *   play: () => [createPaddleEntity(), createBallEntity()],
 * }
 *
 * const types = {
 *   Game: [scenes(SCENES), fsm({ title: { start(e) { e.state = "play" } } })],
 * }
 *
 * const entities = { game: { type: "Game", state: "title" } }
 * ```
 *
 * @param {object} scenesByState - What stands in each state, given the state and the
 *   entity asking. Returns the entity configurations to have standing.
 * @returns {object} The behaviour.
 */
export function scenes(scenesByState) {
  function build(entity, state, api) {
    const leaving = entity[SCENE] ?? []
    const arriving = scenesByState[state]?.(entity) ?? NOTHING

    const leavingIds = leaving.map(({ id }) => id)
    const arrivingIds = arriving.map(({ id }) => id)

    for (const { id } of leaving) {
      if (arrivingIds.includes(id)) continue

      api.notify("remove", id)
    }

    for (const added of arriving) {
      if (!leavingIds.includes(added.id)) {
        api.notify("add", added)

        continue
      }

      // The same thing stands on both sides of the move, so it is neither added nor
      // removed -- but it may be wanted to be a different thing now. A screen's own
      // keyboard carries the keys that screen answers to, so the mapping a state puts up
      // is part of what that state is made of. Only what has actually changed is merged
      // over, which is what leaves a shared thing where the world had put it when the
      // next state says nothing different about it.
      const previous = leaving.find(({ id }) => id === added.id)

      if (!isDeepEqual(previous, added)) {
        api.notify("patch", added)
      }
    }

    entity[SCENE] = arriving
  }

  return {
    create(entity, payload, api) {
      build(entity, entity.state, api)
    },

    // The announcement is broadcast and carries the id, so that anything else listening
    // for it can tell which machine moved. This one is only interested in its own.
    [STATE_CHANGE](entity, { entityId, to }, api) {
      if (entityId !== entity.id) return

      build(entity, to, api)
    },
  }
}

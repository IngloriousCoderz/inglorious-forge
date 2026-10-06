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
 * few screens and a world that survives the move between them -- the title screen has no
 * paddle on it, and the serve and the play share one.
 *
 * Only the difference between two states is touched. Anything they have in common is
 * left standing as it is, which is what carries the paddle, the ball and the level from
 * one state into the next without rebuilding them, and so without losing where the
 * paddle had slid to or what had already been knocked out.
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
      if (leavingIds.includes(added.id)) continue

      api.notify("add", added)
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

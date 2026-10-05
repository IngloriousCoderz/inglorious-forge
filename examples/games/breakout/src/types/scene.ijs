import { LAYER_BRICK } from "../constants.js"
import { createLevel } from "../levelmaker.ijs"
import { createPlayScene } from "./entities.ijs"
import {
  createGameOverScene,
  createPausedEntity,
  createScoreEntities,
  createServePromptEntity,
  createStartScene,
} from "./text-entities.ijs"

/**
 * What stands in each state.
 *
 * In the original a state is handed the world it is to use, and passes the same world
 * on to the next state rather than building a new one. That is why the serve and the
 * play share everything here: the level the serve is waiting over is the level that is
 * about to be played, down to the bricks already knocked out of it.
 *
 * Pausing is not a state, so the pause overlay lives in the play scene and decides for
 * itself whether it has anything to say.
 */
const SCENES = {
  // A new game, so the level the last one was played on is thrown away and a fresh one
  // will be made when this state hands over to the serve.
  start: (entity) => {
    entity.bricks = null

    return createStartScene()
  },

  serve: (entity) => [...createGameScene(entity), createServePromptEntity()],

  play: (entity) => [...createGameScene(entity), createPausedEntity()],

  gameOver: () => createGameOverScene(),
}

/**
 * The world the serve waits over and the play is played on: the paddle, the ball, the
 * score and the hearts, under a level.
 *
 * The level is made at random and is held on the game entity rather than rolled again
 * each time a state is entered, because it is one level across the whole game. Rerolling
 * it per state would quietly put back every brick knocked out of the level before.
 */
function createGameScene(entity) {
  entity.bricks ??= createLevel(LAYER_BRICK)

  return [...createPlayScene(entity.bricks), ...createScoreEntities()]
}

/**
 * Builds the scene a state calls for and takes the old one away.
 *
 * Only the difference between the two is touched. Anything they have in common is left
 * standing as it is, which is what carries the paddle, the ball, the hearts and the
 * level from the serve into the play and back again without rebuilding them -- and so
 * without losing where the paddle had slid to or which bricks were already gone.
 *
 * This is what reacts to the machine announcing its transitions, so the machine itself
 * stays a description of when it moves rather than also being the place that knows what
 * the screen is made of.
 */
export function buildScene(entity, state, api) {
  const leaving = entity.scene ?? []
  const arriving = SCENES[state]?.(entity) ?? []

  const leavingIds = leaving.map(({ id }) => id)
  const arrivingIds = arriving.map(({ id }) => id)

  for (const { id } of leaving) {
    if (!arrivingIds.includes(id)) api.notify("remove", id)
  }

  for (const added of arriving) {
    if (!leavingIds.includes(added.id)) api.notify("add", added)
  }

  entity.scene = arriving
}

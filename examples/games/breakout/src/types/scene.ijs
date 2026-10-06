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
 * In the original a state is handed the world it is to use, and passes the same world on
 * to the next state rather than building a new one. That is why the serve and the play
 * share everything here: the level the serve is waiting over is the level that is about
 * to be played, down to the bricks already knocked out of it.
 *
 * This map is only a description of that. Putting a state's entities up, taking the last
 * state's down, and leaving whatever the two share standing is the engine's `scenes`
 * behaviour, which `game.ijs` pairs with the machine.
 *
 * Pausing is not a state, so the pause overlay lives in the play scene and decides for
 * itself whether it has anything to say.
 */
export const SCENES = {
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
 *
 * The level itself is read off the game entity and passed to the levelmaker, which is
 * what decides how far along the colours and the tiers a level may reach.
 */
function createGameScene(entity) {
  entity.bricks ??= createLevel(entity.level, LAYER_BRICK)

  return [...createPlayScene(entity.bricks), ...createScoreEntities()]
}

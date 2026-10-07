import { FIRST_PADDLE_SKIN, LAYER_BRICK } from "../constants.js"
import { initialName, loadHighScores } from "../high-scores.js"
import { createLevel } from "../levelmaker.ijs"
import { createPlayScene } from "./entities.ijs"
import {
  createEnterHighScoreEntities,
  createGameOverScene,
  createHighScoreEntities,
  createPaddleSelectEntities,
  createPausedEntity,
  createScoreEntities,
  createServeEntities,
  createStartScene,
  createVictoryScene,
} from "./text-entities.ijs"

const FIRST_LEVEL = 1
const NO_LEVEL = null

/**
 * What stands in each state.
 *
 * In the original a state is handed the world it is to use and passes the same world on
 * to the next, which is why the serve and the play share everything here. Putting a
 * state's entities up and taking the last state's down is the engine's `scenes` behaviour,
 * which `game.ijs` pairs with the machine.
 */
export const SCENES = {
  // The table is loaded here rather than by the screen that reads it, because the end of a
  // game weighs the score against it to decide whether there is a name to write.
  start: (entity) => {
    entity.level = FIRST_LEVEL
    entity.bricksLevel = NO_LEVEL
    entity.highScores ??= loadHighScores()

    return createStartScene()
  },

  serve: (entity) => [...createGameScene(entity), ...createServeEntities()],

  play: (entity) => [...createGameScene(entity), createPausedEntity()],

  // The same field as the serve, with the bricks gone and two lines saying so.
  victory: (entity) => [...createGameScene(entity), ...createVictoryScene()],

  gameOver: () => createGameOverScene(),

  paddleSelect: (entity) => {
    entity.paddleSkin ??= FIRST_PADDLE_SKIN

    return createPaddleSelectEntities()
  },

  enterHighScore: (entity) => {
    entity.name ??= initialName()
    entity.letter ??= 1

    return createEnterHighScoreEntities()
  },

  highScores: (entity) => {
    entity.highScores ??= loadHighScores()

    return createHighScoreEntities()
  },
}

/**
 * The world the serve waits over and the play is played on: the paddle, the ball, the
 * score and the hearts, under a level.
 *
 * The level is held on the game entity rather than rolled again on entry, because it is one
 * level across the whole game -- rerolling it per state would put back every brick knocked
 * out of it before.
 */
function createGameScene(entity) {
  if (entity.bricksLevel !== entity.level) {
    entity.bricks = createLevel(entity.level, LAYER_BRICK)
    entity.bricksLevel = entity.level

    // Counted here rather than asked for when a brick goes, because a change made during a
    // pass of events is not visible until that pass has finished.
    entity.bricksLeft = entity.bricks.length
  }

  return [
    ...createPlayScene(entity.bricks, entity.paddleSkin),
    ...createScoreEntities(),
  ]
}

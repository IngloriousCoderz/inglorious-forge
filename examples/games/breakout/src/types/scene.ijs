import { LAYER_BRICK } from "../constants.js"
import { initialName, loadHighScores } from "../high-scores.js"
import { createLevel } from "../levelmaker.ijs"
import { createPlayScene } from "./entities.ijs"
import {
  createEnterHighScoreEntities,
  createGameOverScene,
  createHighScoreEntities,
  createPausedEntity,
  createScoreEntities,
  createServeEntities,
  createStartScene,
  createVictoryScene,
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
  // A new game. The level it starts from is put back to the first, and the level the last
  // game rolled is forgotten rather than kept -- otherwise a game that ended on the first
  // level would begin again on the level it left behind, bricks and all.
  // The table is loaded once, here rather than by the screen that reads it off, because it
  // is not only read: the end of a game weighs the score against it to decide whether
  // there is a name to write. Loading it when the menu needs it would mean the first game
  // had no table to be weighed against -- and the first game is exactly the one the
  // original seeds a score into the table for.
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

  // Where the scores kept between games are read off, rather than where they are kept:
  // the table is loaded once, by whichever screen first needs it.
  // Writing a name in. The letters start on the first letter of the alphabet, all three
  // of them, and the first is the one being changed -- as the original does, rather than
  // as whatever the last game left behind.
  enterHighScore: (entity) => {
    entity.name ??= initialName()
    entity.letter ??= FIRST_SLOT

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
 * The level is made at random and is held on the game entity rather than rolled again
 * each time a state is entered, because it is one level across the whole game. Rerolling
 * it per state would quietly put back every brick knocked out of the level before.
 *
 * The level itself is read off the game entity and passed to the levelmaker, which is
 * what decides how far along the colours and the tiers a level may reach.
 */
function createGameScene(entity) {
  // The level is remade whenever the one it was made for is not the level being played,
  // which is what finishing a level comes to. Rerolling it on every state instead would
  // quietly put back every brick knocked out of the level before.
  if (entity.bricksLevel !== entity.level) {
    entity.bricks = createLevel(entity.level, LAYER_BRICK)
    entity.bricksLevel = entity.level

    // How many are standing. Counted here rather than asked for when a brick goes,
    // because a change made during a pass of events is not visible until that pass has
    // finished -- so a handler that asked would still see the brick it was just told
    // about, along with every brick gone before it in the same pass.
    entity.bricksLeft = entity.bricks.length
  }

  return [...createPlayScene(entity.bricks), ...createScoreEntities()]
}

const FIRST_LEVEL = 1

// Standing in for a level whose bricks have not been made, or have been forgotten.
// Which of the three letters is being changed to begin with: the first.
const FIRST_SLOT = 1

const NO_LEVEL = null

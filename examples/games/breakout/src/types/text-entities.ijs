import { v } from "@inglorious/utils/v.js"

import {
  LAYER_TEXT,
  SCORE_ALTITUDE,
  SCORE_LABEL_X,
  SCORE_VALUE_X,
  WIDTH,
} from "../constants.js"
import {
  GAME_OVER_PROMPT_ALTITUDE,
  GAME_OVER_SCORE_ALTITUDE,
  GAME_OVER_TITLE_ALTITUDE,
  HIGH_SCORES_ALTITUDE,
  PAUSED_ALTITUDE,
  SERVE_ALTITUDE,
  START_ALTITUDE,
  TITLE_ALTITUDE,
} from "./text.ijs"

/**
 * The text that stands on the screen.
 *
 * The original draws all of it from the state it belongs to, so leaving that state takes
 * it away, which is why these are built and cleared with the state rather than being
 * permanent entities.
 */
export function createStartScene() {
  return [
    createTextEntity("title", "Title", TITLE_ALTITUDE),
    createTextEntity("start", "Start", START_ALTITUDE),
    createTextEntity("highScores", "HighScores", HIGH_SCORES_ALTITUDE),
  ]
}

/**
 * "PAUSED" belongs to the game in progress, but pausing is a flag rather than a state, so
 * unlike the menu lines this one does have to say for itself.
 *
 * `updatesWhilePaused` is what lets it keep updating while the world is halted. Without
 * it this would freeze on whatever it last said and the pause screen would never appear.
 */
export function createPausedEntity() {
  return {
    ...createTextEntity("paused", "Paused", PAUSED_ALTITUDE),
    updatesWhilePaused: true,
  }
}

/** The line that says the game is waiting to be served. */
export function createServePromptEntity() {
  return createTextEntity("servePrompt", "ServePrompt", SERVE_ALTITUDE)
}

/**
 * The score readout, which stands over the play and the serve alike because both of them
 * show it.
 *
 * These two are the one piece of interface the original does not centre, so they are
 * placed by their own x rather than across the middle of the screen.
 */
export function createScoreEntities() {
  return [
    {
      ...createTextEntity("scoreLabel", "ScoreLabel", SCORE_ALTITUDE),
      position: v(SCORE_LABEL_X, SCORE_ALTITUDE, 0),
    },
    {
      ...createTextEntity("score", "Score", SCORE_ALTITUDE),
      position: v(SCORE_VALUE_X, SCORE_ALTITUDE, 0),
    },
  ]
}

/** The three lines that say the game is over, and what it came to. */
export function createGameOverScene() {
  return [
    createTextEntity(
      "gameOverTitle",
      "GameOverTitle",
      GAME_OVER_TITLE_ALTITUDE,
    ),
    createTextEntity(
      "gameOverScore",
      "GameOverScore",
      GAME_OVER_SCORE_ALTITUDE,
    ),
    createTextEntity(
      "gameOverPrompt",
      "GameOverPrompt",
      GAME_OVER_PROMPT_ALTITUDE,
    ),
  ]
}

/** A line of the interface, placed the way the original centres its own text. */
function createTextEntity(id, type, altitude) {
  return {
    id,
    type,
    layer: LAYER_TEXT,
    position: v(WIDTH / 2, altitude, 0),
  }
}

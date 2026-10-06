import { v } from "@inglorious/utils/v.js"

import {
  LAYER_TEXT,
  SCORE_LABEL_X,
  SCORE_VALUE_X,
  WIDTH,
} from "../constants.js"
import {
  GAME_OVER_PROMPT_PLACEMENT,
  GAME_OVER_SCORE_PLACEMENT,
  GAME_OVER_TITLE_PLACEMENT,
  HIGH_SCORES_PLACEMENT,
  LEVEL_PLACEMENT,
  PAUSED_PLACEMENT,
  SCORE_LABEL_PLACEMENT,
  SCORE_PLACEMENT,
  SERVE_PLACEMENT,
  START_PLACEMENT,
  TITLE_PLACEMENT,
  VICTORY_PROMPT_PLACEMENT,
  VICTORY_TITLE_PLACEMENT,
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
    createTextEntity("title", "Title", TITLE_PLACEMENT),
    createTextEntity("start", "Start", START_PLACEMENT),
    createTextEntity("highScores", "HighScores", HIGH_SCORES_PLACEMENT),
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
    ...createTextEntity("paused", "Paused", PAUSED_PLACEMENT),
    updatesWhilePaused: true,
  }
}

/** The lines that say the game is waiting to be served, and which level it is. */
export function createServeEntities() {
  return [
    createTextEntity("level", "Level", LEVEL_PLACEMENT),
    createTextEntity("servePrompt", "ServePrompt", SERVE_PLACEMENT),
  ]
}

/**
 * The two lines that say a level has been finished.
 *
 * The paddle, the ball, the score and the lives all stay standing underneath, which is
 * what this screen shares with the serve: it is the same field with the bricks gone.
 */
export function createVictoryScene() {
  return [
    createTextEntity("victoryTitle", "VictoryTitle", VICTORY_TITLE_PLACEMENT),
    createTextEntity(
      "victoryPrompt",
      "VictoryPrompt",
      VICTORY_PROMPT_PLACEMENT,
    ),
  ]
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
      ...createTextEntity("scoreLabel", "ScoreLabel", SCORE_LABEL_PLACEMENT),
      position: v(SCORE_LABEL_X, SCORE_LABEL_PLACEMENT.altitude, 0),
    },
    {
      ...createTextEntity("score", "Score", SCORE_PLACEMENT),
      position: v(SCORE_VALUE_X, SCORE_PLACEMENT.altitude, 0),
    },
  ]
}

/** The three lines that say the game is over, and what it came to. */
export function createGameOverScene() {
  return [
    createTextEntity(
      "gameOverTitle",
      "GameOverTitle",
      GAME_OVER_TITLE_PLACEMENT,
      LEVEL_PLACEMENT,
    ),
    createTextEntity(
      "gameOverScore",
      "GameOverScore",
      GAME_OVER_SCORE_PLACEMENT,
    ),
    createTextEntity(
      "gameOverPrompt",
      "GameOverPrompt",
      GAME_OVER_PROMPT_PLACEMENT,
    ),
  ]
}

/**
 * A line of the interface, placed where the original puts it.
 *
 * The placement is the original's own coordinate turned the right way up, together with
 * which edge of the line sits on it, so neither half has to be worked out here.
 */
function createTextEntity(id, type, { altitude }) {
  return {
    id,
    type,
    layer: LAYER_TEXT,
    position: v(WIDTH / 2, altitude, 0),
  }
}

import { v } from "@inglorious/utils/v.js"

import {
  LAYER_TEXT,
  SCORE_LABEL_X,
  SCORE_VALUE_X,
  WIDTH,
} from "../constants.js"
import { ENTRIES as HIGH_SCORE_ENTRIES } from "../high-scores.js"
import {
  ENTER_SCORE_PROMPT_PLACEMENT,
  ENTERED_LETTER_PLACEMENT,
  GAME_OVER_PROMPT_PLACEMENT,
  GAME_OVER_SCORE_PLACEMENT,
  GAME_OVER_TITLE_PLACEMENT,
  HIGH_SCORES_ITEM_PLACEMENT,
  HIGH_SCORES_PROMPT_PLACEMENT,
  HIGH_SCORES_TITLE_PLACEMENT,
  highScoreRowAltitude,
  LEVEL_PLACEMENT,
  PAUSED_PLACEMENT,
  SCORE_LABEL_PLACEMENT,
  SCORE_PLACEMENT,
  SERVE_PLACEMENT,
  START_PLACEMENT,
  TITLE_PLACEMENT,
  VICTORY_PROMPT_PLACEMENT,
  VICTORY_TITLE_PLACEMENT,
  YOUR_SCORE_PLACEMENT,
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
    createTextEntity("highScores", "HighScores", HIGH_SCORES_ITEM_PLACEMENT),
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

// The columns of the high score table. The original gives each piece of a row its own box,
// so what is wanted is where each box ends rather than where a line of text is centred:
// the position runs left from the first box, and the name and the score run back from
// theirs.
const HIGH_SCORE_NAME_BOX = 50
const HIGH_SCORE_NAME_OFFSET = 38
const HIGH_SCORE_SCORE_BOX = 100

const HIGH_SCORE_POSITION_X = WIDTH / 4
const HIGH_SCORE_NAME_RIGHT =
  WIDTH / 4 + HIGH_SCORE_NAME_BOX + HIGH_SCORE_NAME_OFFSET
const HIGH_SCORE_SCORE_RIGHT = WIDTH / 2 + HIGH_SCORE_SCORE_BOX

// The three letters of a name, which the original spreads about the middle of the screen
// with gaps either side of each.
const ENTERED_LETTER_X = [-28, -6, 20].map((offset) => WIDTH / 2 + offset)

/** The three letters a name is written with. */
export function createEnterHighScoreEntities() {
  const letters = ENTERED_LETTER_X.map((x, slot) => ({
    ...createTextEntity(
      `enteredLetter${slot}`,
      "EnteredLetter",
      ENTERED_LETTER_PLACEMENT,
    ),
    position: v(x, ENTERED_LETTER_PLACEMENT.altitude, 0),
    slot,
  }))

  return [
    createTextEntity("yourScore", "YourScore", YOUR_SCORE_PLACEMENT),
    ...letters,
    createTextEntity(
      "enterScorePrompt",
      "EnterScorePrompt",
      ENTERED_LETTER_PLACEMENT,
      ENTER_SCORE_PROMPT_PLACEMENT,
    ),
  ]
}

/**
 * The ten rows of the high score table.
 *
 * The original lays each row out as three separately aligned pieces -- the position
 * left-aligned in a box of its own, the name right-aligned in another, the score
 * right-aligned in a third -- so a row is three entities and the table is thirty.
 */
export function createHighScoreEntities() {
  const rows = []

  for (let row = 0; row < HIGH_SCORE_ENTRIES; row++) {
    const altitude = highScoreRowAltitude(row)

    rows.push(
      {
        ...createTextEntity(`highScore${row}Position`, "HighScorePosition", {
          altitude,
        }),
        position: v(HIGH_SCORE_POSITION_X, altitude, 0),
        row,
      },
      {
        ...createTextEntity(`highScore${row}Name`, "HighScoreName", {
          altitude,
        }),
        position: v(HIGH_SCORE_NAME_RIGHT, altitude, 0),
        row,
      },
      {
        ...createTextEntity(`highScore${row}Score`, "HighScoreScore", {
          altitude,
        }),
        position: v(HIGH_SCORE_SCORE_RIGHT, altitude, 0),
        row,
      },
    )
  }

  return [
    createTextEntity(
      "highScoresTitle",
      "HighScoreTitle",
      HIGH_SCORES_TITLE_PLACEMENT,
      highScoreRowAltitude,
    ),
    ...rows,
    createTextEntity(
      "highScoresPrompt",
      "HighScoresPrompt",
      HIGH_SCORES_PROMPT_PLACEMENT,
    ),
  ]
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

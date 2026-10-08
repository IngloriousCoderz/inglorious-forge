import { BOTTOM_LEFT } from "@inglorious/engine/physics/anchor.js"
import { v } from "@inglorious/utils/v.js"

import {
  ARROW_SIZE,
  ARROWS_SHEET,
  FIRST_PADDLE_SKIN,
  HEIGHT,
  LAYER_BRICK,
  LEFT_ARROW,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  WIDTH,
} from "../constants.js"
import { ENTRIES as HIGH_SCORE_ROWS } from "../high-scores.js"
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
  SELECT_PADDLE_HINT_PLACEMENT,
  SELECT_PADDLE_PROMPT_PLACEMENT,
  SERVE_PLACEMENT,
  START_PLACEMENT,
  TITLE_PLACEMENT,
  VICTORY_PROMPT_PLACEMENT,
  VICTORY_TITLE_PLACEMENT,
  YOUR_SCORE_PLACEMENT,
} from "./text.ijs"

const TEXT_LAYER = 3
const CENTRED = WIDTH / 2
const NO_DEPTH = 0

/**
 * A line of the interface, placed where the original puts it: its own coordinate turned
 * the right way up, across the middle of the screen unless it is given another x.
 */
function text(id, type, { altitude, x = CENTRED }, own = {}) {
  return {
    id,
    type,
    layer: TEXT_LAYER,
    position: v(x, altitude, NO_DEPTH),
    ...own,
  }
}

/** A row of lines along one altitude, each at its own x. */
function textRow({ altitude, columns, own }) {
  return columns.map(({ id, type, x }) => text(id, type, { altitude, x }, own))
}

// The row the arrows and the paddle stand in, a third of the way up from the bottom --
// which is a third of the way down from the top, once the two are turned over.
const SELECT_ROW_ALTITUDE = HEIGHT / 3
const SELECT_PADDLE_X = WIDTH / 2 - PADDLE_WIDTH / 2

// The original gives each piece of a table row a box of its own, so what is wanted is where
// each box ends rather than where a line of text is centred on it.
const HIGH_SCORE_COLUMNS = [
  { id: "Position", type: "HighScorePosition", x: WIDTH / 4 },
  { id: "Name", type: "HighScoreName", x: WIDTH / 4 + 50 + 38 },
  { id: "Score", type: "HighScoreScore", x: WIDTH / 2 + 100 },
]

// The three letters of a name, which the original spreads about the middle with gaps
// either side of each.
const ENTERED_LETTER_X = [-28, -6, 20].map((offset) => CENTRED + offset)

export function createStartScene() {
  return [
    text("title", "Title", TITLE_PLACEMENT),
    text("start", "Start", START_PLACEMENT),
    text("highScores", "HighScores", HIGH_SCORES_ITEM_PLACEMENT),
  ]
}

/**
 * "PAUSED" belongs to the game in progress, but pausing is a flag rather than a state, so
 * this one has to say for itself. `updatesWhilePaused` is what lets the entity carrying it
 * keep updating while the world is halted.
 */
export function createPausedEntity() {
  return {
    ...text("paused", "Paused", PAUSED_PLACEMENT),
    updatesWhilePaused: true,
  }
}

export function createEnterHighScoreEntities() {
  return [
    text("yourScore", "YourScore", YOUR_SCORE_PLACEMENT),
    ...ENTERED_LETTER_X.map((x, slot) =>
      text(`enteredLetter${slot}`, "EnteredLetter", ENTERED_LETTER_PLACEMENT, {
        position: v(x, ENTERED_LETTER_PLACEMENT.altitude, NO_DEPTH),
        slot,
      }),
    ),
    text("enterScorePrompt", "EnterScorePrompt", ENTER_SCORE_PROMPT_PLACEMENT),
  ]
}

/** Ten rows of three separately aligned pieces, which is thirty entities. */
export function createHighScoreEntities() {
  return [
    text("highScoresTitle", "HighScoreTitle", HIGH_SCORES_TITLE_PLACEMENT),
    ...Array.from({ length: HIGH_SCORE_ROWS }, (_, row) =>
      textRow({
        altitude: highScoreRowAltitude(row),
        columns: HIGH_SCORE_COLUMNS.map(({ id, type, x }) => ({
          id: `highScore${row}${id}`,
          type,
          x,
        })),
        own: { row },
      }),
    ).flat(),
    text("highScoresPrompt", "HighScoresPrompt", HIGH_SCORES_PROMPT_PLACEMENT),
  ]
}

/** An arrow either side of the choice, and the paddle itself in the middle. */
export function createPaddleSelectEntities() {
  return [
    text(
      "selectPaddlePrompt",
      "SelectPaddlePrompt",
      SELECT_PADDLE_PROMPT_PLACEMENT,
    ),
    text("selectPaddleHint", "SelectPaddleHint", SELECT_PADDLE_HINT_PLACEMENT),
    selectArrow(LEFT_ARROW),
    selectArrow(LEFT_ARROW + 1),
    {
      id: "selectPaddle",
      type: "SelectPaddle",
      skin: FIRST_PADDLE_SKIN,
      layer: LAYER_BRICK,
      position: v(SELECT_PADDLE_X, SELECT_ROW_ALTITUDE, NO_DEPTH),
      anchor: BOTTOM_LEFT,
      size: v(PADDLE_WIDTH, PADDLE_HEIGHT, NO_DEPTH),
    },
  ]
}

/** One of the two arrows: which way it points is which column of the sheet it is cut from. */
function selectArrow(arrow) {
  return {
    id: arrow === LEFT_ARROW ? "selectLeftArrow" : "selectRightArrow",
    type: "SelectArrow",
    layer: LAYER_BRICK,
    position: v(
      arrow === LEFT_ARROW ? WIDTH / 4 - ARROW_SIZE : WIDTH - WIDTH / 4,
      SELECT_ROW_ALTITUDE,
      NO_DEPTH,
    ),
    anchor: BOTTOM_LEFT,
    size: v(ARROW_SIZE, ARROW_SIZE, NO_DEPTH),
    image: { id: "arrows", imageSize: ARROWS_SHEET },
    arrow,
    column: arrow,
  }
}

export function createServeEntities() {
  return [
    text("level", "Level", LEVEL_PLACEMENT),
    text("servePrompt", "ServePrompt", SERVE_PLACEMENT),
  ]
}

export function createVictoryScene() {
  return [
    text("victoryTitle", "VictoryTitle", VICTORY_TITLE_PLACEMENT),
    text("victoryPrompt", "VictoryPrompt", VICTORY_PROMPT_PLACEMENT),
  ]
}

/**
 * The score readout, which stands over the play and the serve alike. It is the one piece of
 * interface the original does not centre, so it is placed by its own x.
 */
export function createScoreEntities() {
  return [
    text("scoreLabel", "ScoreLabel", { ...SCORE_LABEL_PLACEMENT, x: 432 - 60 }),
    text("score", "Score", { ...SCORE_PLACEMENT, x: 432 - 50 + 40 }),
  ]
}

export function createGameOverScene() {
  return [
    text("gameOverTitle", "GameOverTitle", GAME_OVER_TITLE_PLACEMENT),
    text("gameOverScore", "GameOverScore", GAME_OVER_SCORE_PLACEMENT),
    text("gameOverPrompt", "GameOverPrompt", GAME_OVER_PROMPT_PLACEMENT),
  ]
}

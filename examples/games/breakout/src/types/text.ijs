import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { text } from "@inglorious/renderer-2d/text.js"

import { paddleFrame } from "../atlas.js"
import {
  ARROW_SIZE,
  ARROWS_SHEET,
  FIRST_PADDLE_SKIN,
  FONT_LARGE,
  FONT_MEDIUM,
  FONT_SMALL,
  HEIGHT,
  LAST_PADDLE_SKIN,
  LEFT_ARROW,
} from "../constants.js"
import { entryOf } from "../high-scores.js"

const TOP_BASELINE = "top"
const MIDDLE_BASELINE = "middle"
const FONT = "'Breakout'"
const WHITE = "white"
const PICKED_OUT = "rgb(103, 255, 255)"
const DIMMED = "rgb(40, 40, 40)"
const FADED = 128 / 255

// The original counts down from the top of the screen and this world counts up from the
// floor, so every line it places is turned over. `printf` centres a line on that point,
// which is the other half of what `print` -- hanging it from its own top edge -- does not.
const at = (y) => HEIGHT - y
const printf = (y) => ({ altitude: at(y), baseline: MIDDLE_BASELINE })
const print = (y) => ({ altitude: at(y), baseline: TOP_BASELINE })

const HIGH_SCORES_FIRST_ROW_Y = 60
const HIGH_SCORES_ROW_STEP = 13

export const TITLE_PLACEMENT = printf(HEIGHT / 3)
export const START_PLACEMENT = printf(HEIGHT / 2 + 70)
export const HIGH_SCORES_ITEM_PLACEMENT = printf(HEIGHT / 2 + 90)
export const PAUSED_PLACEMENT = printf(HEIGHT / 2 - 16)
export const SERVE_PLACEMENT = printf(HEIGHT / 2)
export const LEVEL_PLACEMENT = printf(HEIGHT / 3)
export const VICTORY_TITLE_PLACEMENT = printf(HEIGHT / 4)
export const VICTORY_PROMPT_PLACEMENT = printf(HEIGHT / 2)
export const GAME_OVER_TITLE_PLACEMENT = printf(HEIGHT / 3)
export const GAME_OVER_SCORE_PLACEMENT = printf(HEIGHT / 2)
export const GAME_OVER_PROMPT_PLACEMENT = printf(HEIGHT - HEIGHT / 4)
export const YOUR_SCORE_PLACEMENT = printf(30)
export const SELECT_PADDLE_PROMPT_PLACEMENT = printf(HEIGHT / 4)
export const SELECT_PADDLE_HINT_PLACEMENT = printf(HEIGHT / 3)
export const ENTERED_LETTER_PLACEMENT = print(HEIGHT / 2)
export const ENTER_SCORE_PROMPT_PLACEMENT = printf(HEIGHT - 18)
export const HIGH_SCORES_TITLE_PLACEMENT = printf(20)
export const HIGH_SCORES_PROMPT_PLACEMENT = printf(HEIGHT - 18)
export const SCORE_LABEL_PLACEMENT = print(5)
export const SCORE_PLACEMENT = print(5)

export function highScoreRowAltitude(index) {
  return printf(HIGH_SCORES_FIRST_ROW_Y + index * HIGH_SCORES_ROW_STEP).altitude
}

/** A line that says the same thing every frame. */
const line = (params) =>
  text({
    color: WHITE,
    font: FONT,
    size: FONT_LARGE,
    textAlign: "center",
    ...params,
  })

/**
 * A line worked out from the game each frame, for the numbers that change while it is
 * played and for anything whose colour is not fixed.
 *
 * `read` is handed the game and the line's own entity, so one type can serve a whole row
 * of a table, and answers what to say and -- optionally -- what colour to say it in.
 */
const reads = (read, params) => {
  const said = text({ font: FONT, textAlign: "center", ...params })

  return {
    ...said,

    update(entity, dt, api) {
      said.create(entity)

      const { value, color } = read(api.getEntity("game"), entity)

      entity.value = value
      entity.color = color ?? WHITE
    },
  }
}

/** A menu line, picked out while the game is choosing it. */
const menuItem = (params) => {
  const said = line(params)

  return {
    ...said,

    update(entity, dt, api) {
      said.create(entity)

      const { item } = params

      entity.color =
        api.getEntity("game").menuItem === item ? PICKED_OUT : WHITE
    },
  }
}

export const Title = line({ ...TITLE_PLACEMENT, value: "BREAKOUT" })

export const Start = menuItem({
  ...START_PLACEMENT,
  item: "start",
  size: FONT_MEDIUM,
  value: "START",
})
export const HighScores = menuItem({
  ...HIGH_SCORES_ITEM_PLACEMENT,
  item: "high-scores",
  size: FONT_MEDIUM,
  value: "HIGH SCORES",
})

export const ScoreLabel = line({
  ...SCORE_LABEL_PLACEMENT,
  size: FONT_SMALL,
  textAlign: "left",
  value: "Score:",
})
export const Score = reads(({ score }) => ({ value: String(score) }), {
  ...SCORE_PLACEMENT,
  size: FONT_SMALL,
  textAlign: "right",
})

export const HighScoreTitle = line({
  ...HIGH_SCORES_TITLE_PLACEMENT,
  value: "High Scores",
})

// Each row of the table is three separately aligned pieces, which is what the original
// asks for and why a row is three entities rather than one.
export const HighScorePosition = reads(
  (_, { row }) => ({ value: `${row + 1}.` }),
  {
    size: FONT_MEDIUM,
    textAlign: "left",
  },
)
export const HighScoreName = reads(
  ({ highScores }, { row }) => ({ value: entryOf(highScores[row]).name }),
  { size: FONT_MEDIUM, textAlign: "right" },
)
export const HighScoreScore = reads(
  ({ highScores }, { row }) => ({
    value: String(entryOf(highScores[row]).score),
  }),
  { size: FONT_MEDIUM, textAlign: "right" },
)
export const HighScoresPrompt = line({
  ...HIGH_SCORES_PROMPT_PLACEMENT,
  size: FONT_SMALL,
  value: "Press Escape to return to the main menu!",
})

export const YourScore = reads(
  ({ score }) => ({ value: `Your score: ${score}` }),
  {
    ...YOUR_SCORE_PLACEMENT,
    size: FONT_MEDIUM,
  },
)

export const EnteredLetter = reads(
  (game, { slot }) => ({
    color: slot === game.letter - 1 ? PICKED_OUT : WHITE,
    value: game.name[slot],
  }),
  {
    ...ENTERED_LETTER_PLACEMENT,
    size: FONT_LARGE,
    textAlign: "left",
  },
)
export const EnterScorePrompt = line({
  ...ENTER_SCORE_PROMPT_PLACEMENT,
  size: FONT_SMALL,
  value: "Press Enter to confirm!",
})
export const SelectPaddlePrompt = line({
  ...SELECT_PADDLE_PROMPT_PLACEMENT,
  size: FONT_MEDIUM,
  value: "Select your paddle with left and right!",
})
export const SelectPaddleHint = line({
  ...SELECT_PADDLE_HINT_PLACEMENT,
  size: FONT_SMALL,
  value: "(Press Enter to continue!)",
})

/** The paddle as it would be played with: the thing being chosen, so it follows the choice. */
export const SelectPaddle = {
  render: renderImage,

  create(entity) {
    entity.image = {
      ...entity.image,
      id: "breakout",
      ...paddleFrame(entity.skin),
    }
  },

  update(entity, dt, api) {
    const { paddleSkin = FIRST_PADDLE_SKIN } = api.getEntity("game")

    if (paddleSkin === entity.skin) return

    entity.skin = paddleSkin

    entity.image = {
      ...entity.image,
      id: "breakout",
      ...paddleFrame(paddleSkin),
    }
  },
}

/** One of the two arrows, drawn dimmed when the choice is already as far that way as it goes. */
export const SelectArrow = {
  render: renderImage,

  create(entity) {
    entity.image = {
      ...entity.image,
      id: "arrows",
      imageSize: ARROWS_SHEET,
      x: entity.column * ARROW_SIZE,
      y: 0,
      frameSize: [ARROW_SIZE, ARROW_SIZE],
      tileSize: [ARROW_SIZE, ARROW_SIZE],
    }
  },

  update(entity, dt, api) {
    const { paddleSkin = FIRST_PADDLE_SKIN } = api.getEntity("game")

    const isAtTheEnd =
      entity.arrow === LEFT_ARROW
        ? paddleSkin === FIRST_PADDLE_SKIN
        : paddleSkin === LAST_PADDLE_SKIN

    entity.tint = isAtTheEnd ? DIMMED : WHITE
    entity.opacity = isAtTheEnd ? FADED : 1
  },
}

export const ServePrompt = line({
  ...SERVE_PLACEMENT,
  size: FONT_MEDIUM,
  value: "Press Enter to serve!",
})
export const Level = reads(({ level }) => ({ value: `Level ${level}` }), {
  ...LEVEL_PLACEMENT,
})
export const VictoryTitle = reads(
  ({ level }) => ({ value: `Level ${level} complete!` }),
  { ...VICTORY_TITLE_PLACEMENT },
)
export const VictoryPrompt = line({
  ...VICTORY_PROMPT_PLACEMENT,
  size: FONT_MEDIUM,
  value: "Press Enter to serve!",
})
export const GameOverTitle = line({
  ...GAME_OVER_TITLE_PLACEMENT,
  value: "GAME OVER",
})
export const GameOverScore = reads(
  ({ score }) => ({ value: `Final Score: ${score}` }),
  { ...GAME_OVER_SCORE_PLACEMENT, size: FONT_MEDIUM },
)
export const GameOverPrompt = line({
  ...GAME_OVER_PROMPT_PLACEMENT,
  size: FONT_MEDIUM,
  value: "Press Enter!",
})

/**
 * "PAUSED" belongs to the play scene, but pausing is a flag rather than a state, so this
 * one has to say for itself. `updatesWhilePaused` is what lets the entity carrying it keep
 * updating while the world is halted; without it this would freeze on whatever it last
 * said and the pause screen would never appear.
 */
export const Paused = reads(
  ({ paused }) => ({ value: paused ? "PAUSED" : "" }),
  {
    ...PAUSED_PLACEMENT,
    size: FONT_LARGE,
  },
)

import { renderText } from "@inglorious/renderer-2d/text.js"

import {
  COLOR_HIGHLIGHT,
  COLOR_TEXT,
  FONT_FAMILY,
  FONT_LARGE,
  FONT_MEDIUM,
  FONT_SMALL,
  HEIGHT,
  MENU_HIGH_SCORES,
  MENU_START,
  SCORE_TOP,
} from "../constants.js"

// The two baselines the original's two ways of laying a line out come down to.
const TOP_BASELINE = "top"
const MIDDLE_BASELINE = "middle"

/**
 * Where a line of the original's sits, as this world would place it.
 *
 * The original works down the screen from the top and this one counts up from the
 * floor, so every line it draws needs its own coordinate turned the right way up.
 * Taking them as written would stack the text upside down.
 */
const at = (y) => HEIGHT - y

/**
 * A line the original centres on a point, which its `printf` does.
 *
 * The renderer is asked to anchor the line by its middle, so the position is that point
 * exactly. Placing it by hand instead meant adding or taking off half a line height at
 * every position, and getting it backwards hung every line a whole font below where it
 * belonged.
 */
const printf = (y) => ({ altitude: at(y), baseline: MIDDLE_BASELINE })

/**
 * A line the original hangs from its own top edge, which its `print` does.
 *
 * The altitude is the same as for a centred line; only which edge of the line sits on it
 * is different, and that is said here rather than worked out at the position.
 */
const print = (y) => ({ altitude: at(y), baseline: TOP_BASELINE })

export const TITLE_PLACEMENT = printf(HEIGHT / 3)
export const START_PLACEMENT = printf(HEIGHT / 2 + 70)
export const HIGH_SCORES_PLACEMENT = printf(HEIGHT / 2 + 90)
export const PAUSED_PLACEMENT = printf(HEIGHT / 2 - 16)

// The serve prompt sits across the middle of the field, over the bricks it is waiting on.
export const SERVE_PLACEMENT = printf(HEIGHT / 2)

// The game over screen is three lines: a title high up, the score across the middle and
// a prompt near the bottom, each a third of the way down the screen from the last.
export const GAME_OVER_TITLE_PLACEMENT = printf(HEIGHT / 3)
export const GAME_OVER_SCORE_PLACEMENT = printf(HEIGHT / 2)
export const GAME_OVER_PROMPT_PLACEMENT = printf(HEIGHT - HEIGHT / 4)

// The score readout is the one piece of interface the original prints rather than
// centres, so the label hangs from its top edge. It centres its number instead, which
// leaves the number sitting half a font lower than the label beside it -- so the number
// is printed too, and the two are one line of interface as they plainly are meant to be.
export const SCORE_LABEL_PLACEMENT = print(SCORE_TOP)
export const SCORE_PLACEMENT = print(SCORE_TOP)

/** The parts of a line that do not change from one frame to the next. */
function say(entity, text, size, textAlign, baseline) {
  entity.value = text
  entity.size = size
  entity.font = FONT_FAMILY
  // The original lays out every one of its lines explicitly, and the renderer is
  // left-aligned and top-anchored by default, so both are passed in rather than assumed.
  entity.textAlign = textAlign
  entity.baseline = baseline
}

/**
 * A line of text that says the same thing every frame.
 *
 * Nothing here checks whether the game is on the screen it belongs to: the lines are
 * added and removed with the state that says them, so an existing line is always one
 * that has something to say.
 */
function line(text, place, size = FONT_LARGE, selected, textAlign = "center") {
  return {
    render: renderText,

    update(entity, dt, api) {
      const game = api.getEntity("game")

      say(entity, text, size, textAlign, place.baseline)

      // A line that belongs to the menu is picked out while it is the chosen item.
      const isSelected = selected !== undefined && game.menuItem === selected

      entity.color = isSelected ? COLOR_HIGHLIGHT : COLOR_TEXT
    },
  }
}

/**
 * A line of text that reads the game entity each frame, for the numbers that change
 * while it is being played.
 *
 * The text is worked out from the entity rather than pushed into it, so nothing outside
 * this file has to know how a score is written down.
 */
function reads(read, place, size = FONT_MEDIUM, textAlign = "center") {
  return {
    render: renderText,

    update(entity, dt, api) {
      say(entity, read(api.getEntity("game")), size, textAlign, place.baseline)

      entity.color = COLOR_TEXT
    },
  }
}

export const Title = line("BREAKOUT", TITLE_PLACEMENT)
export const Start = line("START", START_PLACEMENT, FONT_MEDIUM, MENU_START)
export const HighScores = line(
  "HIGH SCORES",
  HIGH_SCORES_PLACEMENT,
  FONT_MEDIUM,
  MENU_HIGH_SCORES,
)

export const ScoreLabel = line(
  "Score:",
  SCORE_LABEL_PLACEMENT,
  FONT_SMALL,
  undefined,
  "left",
)
export const Score = reads(
  ({ score }) => String(score),
  SCORE_PLACEMENT,
  FONT_SMALL,
  "right",
)

export const ServePrompt = line(
  "Press Enter to serve!",
  SERVE_PLACEMENT,
  FONT_MEDIUM,
)

export const GameOverTitle = line(
  "GAME OVER",
  GAME_OVER_TITLE_PLACEMENT,
  FONT_LARGE,
)
export const GameOverScore = reads(
  ({ score }) => `Final Score: ${score}`,
  GAME_OVER_SCORE_PLACEMENT,
  FONT_MEDIUM,
)
export const GameOverPrompt = line(
  "Press Enter!",
  GAME_OVER_PROMPT_PLACEMENT,
  FONT_MEDIUM,
)

/**
 * "PAUSED" belongs to the play scene, but pausing is a flag rather than a state, so
 * unlike the menu lines this one does have to say for itself.
 *
 * The entity carrying this type is the one that sets `updatesWhilePaused`, which is
 * what lets it keep updating while the world is halted. Without it this would freeze
 * on whatever it last said and the pause screen would never appear.
 */
export const Paused = {
  render: renderText,

  update(entity, dt, api) {
    say(
      entity,
      api.getEntity("game").paused ? "PAUSED" : "",
      FONT_LARGE,
      "center",
      MIDDLE_BASELINE,
    )
  },
}

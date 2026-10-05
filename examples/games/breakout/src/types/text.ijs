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
  SCORE_ALTITUDE,
} from "../constants.js"

/**
 * The altitudes are the original's y-down positions turned the right way up, because
 * this world counts from the bottom of the screen. Taking them as they are written in
 * the original's states would stack the text upside down.
 *
 * A text entity is anchored by the top edge of its line -- the renderer anchors text that
 * way so that a position and a line height agree whatever the font's own baseline turns
 * out to be -- so an altitude says where a line *begins*. Getting that backwards hangs
 * every line a whole font below where it belongs.
 */
const top = (y) => HEIGHT - y

/**
 * A line the original lays out with `printf`, which centres a block of text. The block
 * straddles the line it is centred on, so its top edge is half a font above that.
 */
const printf = (y, size) => top(y) + size / 2

export const TITLE_ALTITUDE = printf(HEIGHT / 3, FONT_LARGE)
export const START_ALTITUDE = printf(HEIGHT / 2 + 70, FONT_MEDIUM)
export const HIGH_SCORES_ALTITUDE = printf(HEIGHT / 2 + 90, FONT_MEDIUM)
export const PAUSED_ALTITUDE = printf(HEIGHT / 2 - 16, FONT_LARGE)

// The serve prompt sits across the middle of the field, over the bricks it is waiting on.
export const SERVE_ALTITUDE = printf(HEIGHT / 2, FONT_MEDIUM)

// The game over screen is three lines: a title high up, the score across the middle and
// a prompt near the bottom, each a third of the way down the screen from the last.
export const GAME_OVER_TITLE_ALTITUDE = printf(HEIGHT / 3, FONT_LARGE)
export const GAME_OVER_SCORE_ALTITUDE = printf(HEIGHT / 2, FONT_MEDIUM)
export const GAME_OVER_PROMPT_ALTITUDE = printf(
  HEIGHT - HEIGHT / 4,
  FONT_MEDIUM,
)

/** The parts of a line that do not change from one frame to the next. */
function say(entity, text, size, textAlign = "center") {
  entity.value = text
  entity.size = size
  entity.font = FONT_FAMILY
  // The original aligns every one of its lines explicitly, and the renderer is
  // left-aligned by default, so the alignment is passed in rather than assumed.
  entity.textAlign = textAlign
}

/**
 * A line of text that says the same thing every frame.
 *
 * Nothing here checks whether the game is on the screen it belongs to: the lines are
 * added and removed with the state that says them, so an existing line is always one
 * that has something to say.
 */
function line(
  text,
  altitude,
  size = FONT_LARGE,
  selected,
  textAlign = "center",
) {
  return {
    render: renderText,

    update(entity, dt, api) {
      const game = api.getEntity("game")

      say(entity, text, size, textAlign)

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
 * this file has to know how a score or a life count is written down.
 */
function reads(read, altitude, size = FONT_MEDIUM, textAlign = "center") {
  return {
    render: renderText,

    update(entity, dt, api) {
      say(entity, read(api.getEntity("game")), size, textAlign)

      entity.color = COLOR_TEXT
    },
  }
}

export const Title = line("BREAKOUT", TITLE_ALTITUDE)
export const Start = line("START", START_ALTITUDE, FONT_MEDIUM, MENU_START)
export const HighScores = line(
  "HIGH SCORES",
  HIGH_SCORES_ALTITUDE,
  FONT_MEDIUM,
  MENU_HIGH_SCORES,
)

// The label never changes, but the number beside it is the score itself.
// The label runs inwards from its own edge and the number runs back from the far one,
// which is how the original lays the two halves of the readout out.
export const ScoreLabel = line(
  "Score:",
  SCORE_ALTITUDE,
  FONT_SMALL,
  undefined,
  "left",
)
export const Score = reads(
  ({ score }) => String(score),
  SCORE_ALTITUDE,
  FONT_SMALL,
  "right",
)

export const ServePrompt = line(
  "Press Enter to serve!",
  SERVE_ALTITUDE,
  FONT_MEDIUM,
)

export const GameOverTitle = line(
  "GAME OVER",
  GAME_OVER_TITLE_ALTITUDE,
  FONT_LARGE,
)
export const GameOverScore = reads(
  ({ score }) => `Final Score: ${score}`,
  GAME_OVER_SCORE_ALTITUDE,
  FONT_MEDIUM,
)
export const GameOverPrompt = line(
  "Press Enter!",
  GAME_OVER_PROMPT_ALTITUDE,
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
    say(entity, api.getEntity("game").paused ? "PAUSED" : "", FONT_LARGE)
  },
}

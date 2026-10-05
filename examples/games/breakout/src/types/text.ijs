import { renderText } from "@inglorious/renderer-2d/text.js"

import {
  COLOR_HIGHLIGHT,
  COLOR_TEXT,
  FONT_FAMILY,
  HEIGHT,
  MENU_HIGH_SCORES,
  MENU_START,
} from "../constants.js"

/**
 * The altitudes are the original's y-down positions turned the right way up, because
 * this world counts from the bottom of the screen. Taking them as they are written in
 * `StartState.lua` would stack the menu upside down.
 *
 * The original centres each line with `printf`, which centres a block vertically.
 * Text here hangs off its top edge, so each one drops by half a font to land where
 * the original's does.
 */
const top = (y) => HEIGHT - y
const centred = (y, size) => top(y) - size / 2

export const TITLE_ALTITUDE = top(HEIGHT / 3)
export const START_ALTITUDE = top(HEIGHT / 2 + 70)
export const HIGH_SCORES_ALTITUDE = top(HEIGHT / 2 + 90)
export const PAUSED_ALTITUDE = centred(HEIGHT / 2 - 16, 32)

/** The parts of a line that do not change from one frame to the next. */
function say(entity, text, size) {
  entity.value = text
  entity.size = size
  entity.font = FONT_FAMILY
  // The original centres every line, and the renderer is left-aligned by default, so
  // this has to be said out loud.
  entity.textAlign = "center"
}

/**
 * A line of text that reads the game entity each frame, so the menu can change what it
 * says and which item is picked out without anything reaching into the entity.
 *
 * Nothing here checks whether the game is on the start screen: the lines are added and
 * removed with the state that says them, so an existing line is always one that has
 * something to say.
 */
function line(text, altitude, size = 32, selected) {
  return {
    render: renderText,

    update(entity, dt, api) {
      const game = api.getEntity("game")

      say(entity, text, size)

      // A line that belongs to the menu is picked out while it is the chosen item.
      const isSelected = selected !== undefined && game.menuItem === selected

      entity.color = isSelected ? COLOR_HIGHLIGHT : COLOR_TEXT
    },
  }
}

export const Title = line("BREAKOUT", TITLE_ALTITUDE)
export const Start = line("START", START_ALTITUDE, 16, MENU_START)
export const HighScores = line(
  "HIGH SCORES",
  HIGH_SCORES_ALTITUDE,
  16,
  MENU_HIGH_SCORES,
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
    say(entity, api.getEntity("game").paused ? "PAUSED" : "", 32)
  },
}

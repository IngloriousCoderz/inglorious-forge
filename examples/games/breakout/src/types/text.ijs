import { renderText } from "@inglorious/renderer-2d/text.js"
import { v } from "@inglorious/utils/v.js"

import {
  COLOR_HIGHLIGHT,
  COLOR_TEXT,
  FONT_FAMILY,
  FONT_SIZE_LARGE,
  FONT_SIZE_MEDIUM,
  HIGH_SCORES_ALTITUDE,
  MENU_HIGH_SCORES,
  MENU_START,
  NO_DEPTH,
  PAUSED_ALTITUDE,
  START_ALTITUDE,
  TITLE_ALTITUDE,
  WIDTH,
} from "../constants.js"

const X = 0
const Y = 1
const CENTERED = 0.5

/**
 * A line of text that reads the game entity each frame, so the menu can change what
 * it says and which item is picked out without anything reaching into the entity.
 *
 * Nothing here checks whether the game is on the start screen: the lines are added
 * and removed with the state that says them, so an existing line is always one that
 * has something to say.
 */
function line(text, altitude, size = FONT_SIZE_LARGE, selected) {
  return {
    render: renderText,

    update(entity, dt, api) {
      const game = api.getEntity("game")

      entity.value = text
      entity.size = size
      entity.font = FONT_FAMILY
      // The original centres every line, and the renderer is left-aligned by
      // default, so this has to be said out loud.
      entity.textAlign = "center"
      // A line that belongs to the menu is picked out while it is the chosen item.
      const isSelected = selected !== undefined && game.menuItem === selected

      entity.color = isSelected ? COLOR_HIGHLIGHT : COLOR_TEXT
    },
  }
}

export const Title = line("BREAKOUT", TITLE_ALTITUDE, FONT_SIZE_LARGE)
export const Start = line("START", START_ALTITUDE, FONT_SIZE_MEDIUM, MENU_START)
export const HighScores = line(
  "HIGH SCORES",
  HIGH_SCORES_ALTITUDE,
  FONT_SIZE_MEDIUM,
  MENU_HIGH_SCORES,
)

/**
 * "PAUSED" only ever exists while the game is paused, because it is added and removed
 * with that state, so it does not have to check for itself.
 */
export const Paused = line("PAUSED", PAUSED_ALTITUDE, FONT_SIZE_LARGE)

/** Where a line of text sits: centred on the screen at the given altitude. */
export function positionFor(altitude) {
  return v(WIDTH * CENTERED, altitude, NO_DEPTH)
}

export { X, Y }

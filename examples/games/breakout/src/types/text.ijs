import { renderText } from "@inglorious/renderer-2d/text.js"
import { v } from "@inglorious/utils/v.js"

import {
  COLOR_HIGHLIGHT,
  COLOR_TEXT,
  FONT_FAMILY,
  FONT_SIZE_LARGE,
  FONT_SIZE_MEDIUM,
  GAME_STATE,
  HIGH_SCORES_ALTITUDE,
  MENU_HIGH_SCORES,
  MENU_START,
  NO_DEPTH,
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
 * "PAUSED" is only a thing while the game is paused, so it reads as an ordinary
 * line of text that happens to show only in that state.
 */
export const Paused = {
  render: renderText,

  update(entity, dt, api) {
    const game = api.getEntity("game")

    entity.value = game.state === GAME_STATE.paused ? "PAUSED" : ""
    entity.size = FONT_SIZE_LARGE
    entity.font = FONT_FAMILY
    entity.textAlign = "center"
  },
}

/** Where a line of text sits: centred on the screen at the given altitude. */
export function positionFor(altitude) {
  return v(WIDTH * CENTERED, altitude, NO_DEPTH)
}

export { X, Y }

import { v } from "@inglorious/utils/v.js"

import { LAYER_TEXT, WIDTH } from "../constants.js"
import {
  HIGH_SCORES_ALTITUDE,
  PAUSED_ALTITUDE,
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

/** A line of the interface, placed the way the original centres its own text. */
function createTextEntity(id, type, altitude) {
  return {
    id,
    type,
    layer: LAYER_TEXT,
    position: v(WIDTH / 2, altitude, 0),
  }
}

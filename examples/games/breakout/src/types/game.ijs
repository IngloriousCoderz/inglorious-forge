import { fsm } from "@inglorious/engine/behaviors/fsm"
import { v } from "@inglorious/utils/v.js"

import {
  BOTTOM_EDGE,
  LAYER_PADDLE,
  LEFT_EDGE,
  MENU_ITEMS,
  MENU_START,
  NEXT_ITEM,
  NO_DEPTH,
  PADDLE_ALTITUDE,
  PADDLE_HEIGHT,
  PADDLE_START_X,
  PADDLE_WIDTH,
  PREVIOUS_ITEM,
} from "../constants.js"

/**
 * Two states so far: the start screen, and playing. Pausing is a third rather than
 * a flag, because a paused game has to be able to stop everything that moves, and
 * a state is the only thing that stops an entity updating.
 */
export const Game = fsm({
  start: {
    pressMenuUp(entity) {
      chooseMenu(entity, PREVIOUS_ITEM)
    },

    pressMenuDown(entity) {
      chooseMenu(entity, NEXT_ITEM)
    },

    press(entity, _, api) {
      api.notify("soundPlay", "confirm")

      // The paddle belongs to a game in progress, so it is added when one starts
      // rather than sitting there behind the menu.
      api.notify("add", paddleEntity())

      entity.state = "play"
    },
  },

  play: {
    pause(entity, _, api) {
      api.notify("soundPlay", "pause")
      entity.state = "paused"
    },
  },

  paused: {
    pause(entity) {
      entity.state = "play"
    },
  },
})

/**
 * The paddle floats a paddle's own height above the floor, anchored by its
 * bottom-left corner so that corner is what the bounds keep on screen.
 *
 * `movement` is declared up front rather than in the type's `create`, because a
 * movement event can be handled before the entity has been created.
 */
function paddleEntity() {
  return {
    id: "paddle",
    type: "Paddle",
    layer: LAYER_PADDLE,
    position: v(PADDLE_START_X, PADDLE_ALTITUDE, NO_DEPTH),
    anchor: [LEFT_EDGE, BOTTOM_EDGE],
    size: v(PADDLE_WIDTH, PADDLE_HEIGHT, NO_DEPTH),
    movement: {},
  }
}

/** The menu wraps, so pressing up from the first item lands on the last. */
function chooseMenu(entity, step) {
  const current = MENU_ITEMS.indexOf(entity.menuItem)
  const next = (current + step + MENU_ITEMS.length) % MENU_ITEMS.length

  entity.menuItem = MENU_ITEMS[next]

  return entity.menuItem
}

export { MENU_START }

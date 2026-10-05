import { fsm } from "@inglorious/engine/behaviors/fsm"
import { v } from "@inglorious/utils/v.js"

import {
  BOTTOM_EDGE,
  GAME_STATE,
  HIGH_SCORES_ALTITUDE,
  LAYER_PADDLE,
  LAYER_TEXT,
  LEFT_EDGE,
  MENU_ITEMS,
  MENU_START,
  NEXT_ITEM,
  NO_DEPTH,
  PADDLE_ALTITUDE,
  PADDLE_HEIGHT,
  PADDLE_START_X,
  PADDLE_WIDTH,
  PAUSED_ALTITUDE,
  PREVIOUS_ITEM,
  SOUND_CONFIRM,
  SOUND_PADDLE_HIT,
  SOUND_PAUSE,
  START_ALTITUDE,
  TITLE_ALTITUDE,
} from "../constants.js"
import { positionFor } from "./text.ijs"

const TITLE_ID = "title"
const START_ID = "start"
const HIGH_SCORES_ID = "highScores"
const PAUSED_ID = "paused"
const PADDLE_ID = "paddle"

/**
 * What exists in each state.
 *
 * In the original every one of these is drawn by the state it belongs to, so moving
 * between states takes them away by itself. Here the game announces its transitions
 * and this decides what should be there, which keeps the entities honest: a line of
 * text that is not being said is not in the store at all, rather than sitting in it
 * with nothing to say.
 */
const SCENES = {
  [GAME_STATE.start]: [TITLE_ID, START_ID, HIGH_SCORES_ID],
  [GAME_STATE.play]: [PADDLE_ID],
  [GAME_STATE.paused]: [PADDLE_ID, PAUSED_ID],
}

const BUILDERS = {
  [TITLE_ID]: () => text(TITLE_ID, "Title", TITLE_ALTITUDE),
  [START_ID]: () => text(START_ID, "Start", START_ALTITUDE),
  [HIGH_SCORES_ID]: () =>
    text(HIGH_SCORES_ID, "HighScores", HIGH_SCORES_ALTITUDE),
  [PAUSED_ID]: () => text(PAUSED_ID, "Paused", PAUSED_ALTITUDE),
  [PADDLE_ID]: paddleEntity,
}

/**
 * Two states so far: the start screen, and playing. Pausing is a third rather than
 * a flag, because a paused game has to be able to stop everything that moves, and
 * a state is the only thing that stops an entity updating.
 */
export const Game = [
  {
    // The scene the game opened on, so that the first transition knows what to take
    // away as well as what to put down.
    create(entity, payload, api) {
      entity.scene = entity.state

      SCENES[entity.scene].forEach((id) => api.notify("add", BUILDERS[id]()))
    },

    // The machine announces its own transitions, and this is what reacts to them, so
    // the machine stays a description of when it moves rather than also being the
    // place that knows what the screen is made of.
    stateChange(entity, { entityId, to }, api) {
      if (entityId !== entity.id) return

      const leaving = SCENES[entity.scene] ?? []
      const arriving = SCENES[to] ?? []

      leaving
        .filter((id) => !arriving.includes(id))
        .forEach((id) => api.notify("remove", id))

      arriving
        .filter((id) => !leaving.includes(id))
        .forEach((id) => api.notify("add", BUILDERS[id]()))

      entity.scene = to
    },
  },

  fsm({
    start: {
      // Moving between the menu items plays a sound, once per move rather than once
      // per key, because both arrows share the one handler in the original too.
      pressMenuUp(entity, _, api) {
        chooseMenu(entity, PREVIOUS_ITEM)

        api.notify("soundPlay", SOUND_PADDLE_HIT)
      },

      pressMenuDown(entity, _, api) {
        chooseMenu(entity, NEXT_ITEM)

        api.notify("soundPlay", SOUND_PADDLE_HIT)
      },

      press(entity, _, api) {
        api.notify("soundPlay", SOUND_CONFIRM)

        entity.state = GAME_STATE.play
      },
    },

    play: {
      pause(entity, _, api) {
        api.notify("soundPlay", SOUND_PAUSE)

        entity.state = GAME_STATE.paused
      },
    },

    paused: {
      // The original plays its pause sound on the way in and on the way out again, so
      // resuming is not silent.
      pause(entity, _, api) {
        api.notify("soundPlay", SOUND_PAUSE)

        entity.state = GAME_STATE.play
      },
    },
  }),
]

/** A line of the interface, placed the way the original centres its own text. */
function text(id, type, altitude) {
  return {
    id,
    type,
    layer: LAYER_TEXT,
    position: positionFor(altitude),
  }
}

/**
 * The paddle floats a paddle's own height above the floor, anchored by its
 * bottom-left corner so that corner is what the bounds keep on screen.
 *
 * `movement` is declared up front rather than in the type's `create`, because a
 * movement event can be handled before the entity has been created.
 */
function paddleEntity() {
  return {
    id: PADDLE_ID,
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

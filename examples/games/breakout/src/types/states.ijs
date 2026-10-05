import { fsm } from "@inglorious/engine/behaviors/fsm"

import { GAME_STATE, MENU_ITEMS } from "../constants.js"

/**
 * Two states: the start screen, and playing. Pausing is a flag on the second rather
 * than a state of its own, which is what the original does.
 *
 * This says only when the machine moves. What each state is made of lives in
 * `scenes.ijs`, which is announced to this machine's listener when it lands somewhere.
 */
export const Game = fsm({
  [GAME_STATE.start]: {
    // Moving between the menu items plays a sound, once per move rather than once
    // per key, because both arrows share the one handler in the original too.
    pressMenuUp(entity, _, api) {
      chooseMenu(entity, -1)

      api.notify("soundPlay", "paddleHit")
    },

    pressMenuDown(entity, _, api) {
      chooseMenu(entity, 1)

      api.notify("soundPlay", "paddleHit")
    },

    press(entity, _, api) {
      api.notify("soundPlay", "confirm")

      entity.state = GAME_STATE.play
    },
  },

  [GAME_STATE.play]: {
    // Pausing is the engine's own: it sets the flag on the game entity and halts the
    // world, so nothing that moves has to check for itself. This only decides which way
    // round to send it, which is what the original's single key does too.
    //
    // It is not named `pause`, because that is the built-in event and a state that
    // answers to it would run alongside the built-in rather than instead of it.
    togglePause(entity, _, api) {
      api.notify("soundPlay", "pause")

      api.notify(entity.paused ? "resume" : "pause")
    },
  },
})

/** The menu wraps, so pressing up from the first item lands on the last. */
function chooseMenu(entity, step) {
  const current = MENU_ITEMS.indexOf(entity.menuItem)
  const next = (current + step + MENU_ITEMS.length) % MENU_ITEMS.length

  entity.menuItem = MENU_ITEMS[next]

  return entity.menuItem
}

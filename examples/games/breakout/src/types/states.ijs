import { fsm } from "@inglorious/engine/behaviors/fsm"

import {
  GAME_STATE,
  MAX_HEALTH,
  MENU_ITEMS,
  SCORE_PER_BRICK,
  SOUND_CONFIRM,
  SOUND_HURT,
  SOUND_PADDLE_HIT,
  SOUND_PAUSE,
} from "../constants.js"

/**
 * Four states now: the start screen, the wait before each serve, the play itself, and
 * the end. Pausing is still a flag on the play state rather than a state of its own,
 * which is what the original does.
 *
 * This says only when the machine moves. What each state is made of lives in `scene.ijs`,
 * which is announced to this machine's listener when it lands somewhere.
 */
export const Game = fsm({
  [GAME_STATE.start]: {
    // Moving between the menu items plays a sound, once per move rather than once
    // per key, because both arrows share the one handler in the original too.
    pressMenuUp(entity, _, api) {
      chooseMenu(entity, -1)

      api.notify("soundPlay", SOUND_PADDLE_HIT)
    },

    pressMenuDown(entity, _, api) {
      chooseMenu(entity, 1)

      api.notify("soundPlay", SOUND_PADDLE_HIT)
    },

    press(entity, _, api) {
      api.notify("soundPlay", SOUND_CONFIRM)

      // A new game starts with every life and nothing scored. The level itself is made
      // by the scene, which is told to throw the last one away.
      entity.health = MAX_HEALTH
      entity.score = 0

      entity.state = GAME_STATE.serve
    },
  },

  // Nothing happens here but wait. The ball rides on the paddle and the level stands
  // where the last game left it, and pressing says go.
  [GAME_STATE.serve]: {
    press(entity) {
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
      api.notify("soundPlay", SOUND_PAUSE)

      api.notify(entity.paused ? "resume" : "pause")
    },

    // A brick knocked out is worth points, and the score is the game's own.
    brickHit(entity) {
      entity.score += SCORE_PER_BRICK
    },

    // The ball falling past the floor costs a life. Whether that ends the game or merely
    // means another serve is the game's decision, not the ball's, which is why the ball
    // only says what happened.
    ballLost(entity, _, api) {
      api.notify("soundPlay", SOUND_HURT)

      entity.health -= 1

      entity.state =
        entity.health === 0 ? GAME_STATE.gameOver : GAME_STATE.serve
    },
  },

  [GAME_STATE.gameOver]: {
    press(entity) {
      entity.state = GAME_STATE.start
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

import { fsm } from "@inglorious/engine/behaviors/fsm"

import { brickColourOf, brickTierOf } from "../atlas.js"
import {
  BRICK_COLOR_SCORE,
  BRICK_TIER_SCORE,
  GAME_STATE,
  MAX_HEALTH,
  MENU_HIGH_SCORES,
  MENU_ITEMS,
  SOUND_CONFIRM,
  SOUND_HURT,
  SOUND_PADDLE_HIT,
  SOUND_PAUSE,
  SOUND_VICTORY,
  SOUND_WALL_HIT,
} from "../constants.js"

/**
 * Five states now: the start screen, the wait before each serve, the play itself, the end
 * of a level, and the end of the game. Pausing is still a flag on the play state rather
 * than a state of its own, which is what the original does.
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

      // The second item of the menu reads the scores rather than starting a game. Which
      // of the two was chosen is the menu's decision, so it is asked about here.
      if (entity.menuItem === MENU_HIGH_SCORES) {
        entity.state = GAME_STATE.highScores

        return
      }

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

    // A brick hit is worth the tier and the colour it was hit at. The rule is the game's
    // rather than the brick's: the brick says what it is, and what that is worth is
    // decided here.
    brickHit(entity, { hp }) {
      entity.score +=
        brickTierOf(hp) * BRICK_TIER_SCORE +
        brickColourOf(hp) * BRICK_COLOR_SCORE
    },

    // The last brick to go finishes the level. `remove` is announced to everything, so a
    // brick that is only knocked back is not counted -- it has not gone anywhere.
    //
    // Everything leaving the world is announced, and a good deal leaves it on the way
    // between two screens, so what went is asked about before it is counted. The entity
    // still reads as what it was, because the state is only published once the pass is
    // finished.
    remove(entity, id, api) {
      if (api.getEntity(id)?.type !== BRICK) return

      entity.bricksLeft -= ONE_BRICK

      if (entity.bricksLeft > BRICKS_STILL_STANDING) return

      api.notify("soundPlay", SOUND_VICTORY)

      entity.state = GAME_STATE.victory
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

  // The level is finished. It stands on the same field the serve did, with the paddle
  // where the last life left it, and answers Enter by starting the next level -- which is
  // a new level of bricks, and the same score and the same lives.
  [GAME_STATE.victory]: {
    press(entity) {
      entity.level += NEXT_LEVEL

      entity.state = GAME_STATE.serve
    },
  },

  // The scores kept between games. Nothing on this screen changes one -- nothing does
  // yet -- and Escape goes back to the menu rather than out of the game, which is the one
  // place the original takes the way out for itself.
  [GAME_STATE.highScores]: {
    quit(entity, _, api) {
      api.notify("soundPlay", SOUND_WALL_HIT)

      entity.state = GAME_STATE.start
    },
  },

  [GAME_STATE.gameOver]: {
    press(entity) {
      entity.state = GAME_STATE.start
    },
  },
})

// What has to have gone for the level to be over.
const BRICK = "Brick"

const ONE_BRICK = 1
const BRICKS_STILL_STANDING = 0

const NEXT_LEVEL = 1

/** The menu wraps, so pressing up from the first item lands on the last. */
function chooseMenu(entity, step) {
  const current = MENU_ITEMS.indexOf(entity.menuItem)
  const next = (current + step + MENU_ITEMS.length) % MENU_ITEMS.length

  entity.menuItem = MENU_ITEMS[next]

  return entity.menuItem
}

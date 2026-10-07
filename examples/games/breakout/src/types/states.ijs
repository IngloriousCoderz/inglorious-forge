import { fsm } from "@inglorious/engine/behaviors/state-machine/fsm.js"

import { brickColourOf, brickTierOf } from "../atlas.js"
import {
  BRICK_COLOR_SCORE,
  BRICK_TIER_SCORE,
  FIRST_PADDLE_SKIN,
  GAME_STATE,
  LAST_PADDLE_SKIN,
  MAX_HEALTH,
  MAX_RECOVER_POINTS,
  MENU_HIGH_SCORES,
  MENU_ITEMS,
  RECOVER_POINTS,
  SOUND_CONFIRM,
  SOUND_HIGH_SCORE,
  SOUND_HURT,
  SOUND_NO_SELECT,
  SOUND_PADDLE_HIT,
  SOUND_PAUSE,
  SOUND_RECOVER,
  SOUND_SELECT,
  SOUND_VICTORY,
  SOUND_WALL_HIT,
} from "../constants.js"
import {
  rankOf,
  recordScore,
  saveHighScores,
  scrollName,
} from "../high-scores.js"

/**
 * Five states now: the start screen, the wait before each serve, the play itself, the end
 * of a level, and the end of the game. Pausing is still a flag on the play state rather
 * than a state of its own, which is what the original does.
 *
 * This says only when the machine moves. What each state is made of lives in `scene.ijs`,
 * which is announced to this machine's listener when it lands somewhere.
 */
// Which of the three letters of a name is being changed, counted from one as the original
// counts it.
const FIRST_LETTER_SLOT = 1
const LAST_LETTER_SLOT = 3

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

      entity.state = GAME_STATE.paddleSelect
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

      entity.bricksLeft -= 1

      // A brick is worth points, and enough points is worth a life back. The bar doubles
      // each time one is recovered, so the gaps between them grow the further on the game
      // gets, and it is settled before the level is checked for being over -- the last
      // brick of a level is worth a life as much as any other.
      if (entity.score > entity.recoverPoints) {
        entity.health = Math.min(MAX_HEALTH, entity.health + 1)
        entity.recoverPoints = Math.min(
          MAX_RECOVER_POINTS,
          entity.recoverPoints * 2,
        )

        api.notify("soundPlay", SOUND_RECOVER)
      }

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
      entity.level += 1

      entity.state = GAME_STATE.serve
    },
  },

  // Which paddle to play with. Four of them, the same width in four colours, so what is
  // being chosen is a look rather than a size. Reaching either end is said rather than
  // done: the original plays a different sound and leaves the arrow dimmed.
  [GAME_STATE.paddleSelect]: {
    moveLeft(entity, _, api) {
      choosePaddle(entity, -1, api)
    },

    moveRight(entity, _, api) {
      choosePaddle(entity, 1, api)
    },

    press(entity, _, api) {
      api.notify("soundPlay", SOUND_CONFIRM)

      entity.health = MAX_HEALTH
      entity.score = 0
      entity.recoverPoints = RECOVER_POINTS

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

  // The end of a game is where a score is weighed against the table. A score that beats
  // something in it is worth writing down, and one that beats nothing is not -- so the
  // table decides, and the game is only told which of the two happened.
  [GAME_STATE.gameOver]: {
    press(entity, _, api) {
      const rank = rankOf(entity.highScores, entity.score)

      if (rank === null) {
        entity.state = GAME_STATE.start

        return
      }

      api.notify("soundPlay", SOUND_HIGH_SCORE)

      entity.scoreRank = rank
      entity.state = GAME_STATE.enterHighScore
    },
  },

  // Writing a name in, three letters at a time. Left and right choose which letter is
  // being changed and up and down change it; the original plays a sound for moving
  // between the letters and not for scrolling them, and that is kept.
  [GAME_STATE.enterHighScore]: {
    moveLeft(entity, _, api) {
      if (entity.letter === FIRST_LETTER_SLOT) return

      entity.letter -= 1

      api.notify("soundPlay", SOUND_SELECT)
    },

    moveRight(entity, _, api) {
      if (entity.letter === LAST_LETTER_SLOT) return

      entity.letter += 1

      api.notify("soundPlay", SOUND_SELECT)
    },

    pressMenuUp(entity) {
      scrollLetter(entity, 1)
    },

    pressMenuDown(entity) {
      scrollLetter(entity, -1)
    },

    // Enter takes the name as it stands, puts it in the table where it earned its place,
    // moves the rest down, and writes the table back down to be read next time.
    press(entity) {
      recordScore(
        entity.highScores,
        entity.scoreRank,
        entity.name,
        entity.score,
      )

      saveHighScores(entity.highScores)

      entity.state = GAME_STATE.highScores
    },
  },
})

// What has to have gone for the level to be over.
const BRICK = "Brick"

const BRICKS_STILL_STANDING = 0

// The three letters of a name, and which of them is being changed.
// A letter scrolls up and down from A to Z and wraps round at both ends, the way the
// original's three slots do.
function scrollLetter(entity, step) {
  // Which letter is being changed is counted from one, as the original counts it, and a
  // name is counted from zero.
  entity.name = scrollName(entity.name, entity.letter - 1, step)
}

/**
 * Moves the choice one along, or says it cannot.
 *
 * The paddles do not wrap: the first and the last are ends, and pressing into one plays
 * the sound that means "no" rather than moving to somewhere else.
 */
function choosePaddle(entity, step, api) {
  const chosen = entity.paddleSkin + step

  if (chosen < FIRST_PADDLE_SKIN || chosen > LAST_PADDLE_SKIN) {
    api.notify("soundPlay", SOUND_NO_SELECT)

    return
  }

  api.notify("soundPlay", SOUND_SELECT)

  entity.paddleSkin = chosen
}

/** The menu wraps, so pressing up from the first item lands on the last. */
function chooseMenu(entity, step) {
  const current = MENU_ITEMS.indexOf(entity.menuItem)
  const next = (current + step + MENU_ITEMS.length) % MENU_ITEMS.length

  entity.menuItem = MENU_ITEMS[next]

  return entity.menuItem
}

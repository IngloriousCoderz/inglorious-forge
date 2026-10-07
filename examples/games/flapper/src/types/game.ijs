import { fsm } from "@inglorious/engine/behaviors/state-machine/fsm.js"
import { clamp } from "@inglorious/utils/math/numbers.js"
import { random } from "@inglorious/utils/math/rng.js"

import {
  COUNTDOWN_START,
  COUNTDOWN_TIME,
  GAME_STATE,
  GAP_Y_SPREAD,
  INITIAL_GAP_Y,
  INITIAL_GAP_Y_SPREAD,
  MAX_GAP_Y,
  MIN_GAP_Y,
  PIPE_SPAWN_INTERVAL,
  SCORE_GRACE_TIME,
} from "../constants.js"
import { clearPipes, spawnPipePair } from "./pipe.ijs"

// The gap is lowered by a random amount, so the first pipe of a round sits
// somewhere between the highest and the lowest gap of the ones after it.
const NO_LOWERING = 0
const NO_COUNT = 0

function randomGapY() {
  return INITIAL_GAP_Y - random(NO_LOWERING, INITIAL_GAP_Y_SPREAD)
}

// The stage belongs to a round, so it is cleared as soon as a round is over
// rather than when the next one begins.
function startCountdown(entity, api) {
  entity.state = GAME_STATE.countdown
  entity.count = COUNTDOWN_START
  entity.timer = 0
  entity.score = 0

  clearPipes(api)
  api.notify("reset")

  // The world was held still for the game over screen. It has to start moving again
  // here rather than when play starts, because the countdown is what leads there and
  // the countdown needs to be updated in order to finish.
  api.notify("resume")
}

function startPlay(entity) {
  entity.state = GAME_STATE.play
  entity.pipeTimer = 0
  entity.lastGapY = randomGapY()
}

export const Game = fsm({
  [GAME_STATE.title]: {
    press(entity, _, api) {
      startCountdown(entity, api)
    },
  },

  [GAME_STATE.countdown]: {
    update(entity, dt, api) {
      entity.timer += dt
      if (entity.timer <= COUNTDOWN_TIME) return

      entity.timer %= COUNTDOWN_TIME
      entity.count--

      if (entity.count === NO_COUNT) {
        startPlay(entity, api)
      }
    },
  },

  [GAME_STATE.play]: {
    press(entity, _, api) {
      api.notify("birdFlap")
    },

    pipeScored(entity, _, api) {
      entity.score++
      api.notify("soundPlay", "score")
    },

    birdHit(entity, _, api) {
      entity.state = GAME_STATE.score
      entity.timer = 0
      api.notify("pause")
      api.notify("soundPlay", "explosion")
      api.notify("soundPlay", "hurt")
    },

    update(entity, dt, api) {
      entity.pipeTimer += dt
      if (entity.pipeTimer <= PIPE_SPAWN_INTERVAL) return

      entity.pipeTimer = 0
      // Keep consecutive gaps close to each other, so that they never get too
      // far apart vertically.
      entity.lastGapY = clamp(
        entity.lastGapY + random(-GAP_Y_SPREAD, GAP_Y_SPREAD),
        MIN_GAP_Y,
        MAX_GAP_Y,
      )

      spawnPipePair(api, entity.lastGapY)
    },
  },

  [GAME_STATE.score]: {
    update(entity, dt) {
      entity.timer += dt
    },

    press(entity, _, api) {
      if (entity.timer < SCORE_GRACE_TIME) return

      startCountdown(entity, api)
    },
  },
})

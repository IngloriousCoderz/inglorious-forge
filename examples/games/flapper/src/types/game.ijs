import { fsm } from "@inglorious/engine/behaviors/state-machine/fsm.js"
import { clamp } from "@inglorious/utils/math/number.js"
import { random } from "@inglorious/utils/math/rng.js"

import { clearPipes, spawnPipePair } from "./pipe.ijs"

// The gap is lowered by a random amount, so the first pipe of a round sits
// somewhere between the highest and the lowest gap of the ones after it.
const NO_LOWERING = 0
const NO_COUNT = 0

function randomGapY() {
  return 288 - 10 * 2 - random(NO_LOWERING, 80)
}

// The stage belongs to a round, so it is cleared as soon as a round is over
// rather than when the next one begins.
function startCountdown(entity, api) {
  entity.state = "countdown"
  entity.count = 3
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
  entity.state = "play"
  entity.pipeTimer = 0
  entity.lastGapY = randomGapY()
}

export const Game = fsm({
  ["title"]: {
    press(entity, _, api) {
      startCountdown(entity, api)
    },
  },

  ["countdown"]: {
    update(entity, dt, api) {
      entity.timer += dt
      if (entity.timer <= 0.75) return

      entity.timer %= 0.75
      entity.count--

      if (entity.count === NO_COUNT) {
        startPlay(entity, api)
      }
    },
  },

  ["play"]: {
    press(entity, _, api) {
      api.notify("birdFlap")
    },

    pipeScored(entity, _, api) {
      entity.score++
      api.notify("soundPlay", "score")
    },

    birdHit(entity, _, api) {
      entity.state = "score"
      entity.timer = 0
      api.notify("pause")
      api.notify("soundPlay", "explosion")
      api.notify("soundPlay", "hurt")
    },

    update(entity, dt, api) {
      entity.pipeTimer += dt
      if (entity.pipeTimer <= 2) return

      entity.pipeTimer = 0
      // Keep consecutive gaps close to each other, so that they never get too
      // far apart vertically.
      entity.lastGapY = clamp(entity.lastGapY + random(-20, 20), 72, 288 - 10)

      spawnPipePair(api, entity.lastGapY)
    },
  },

  ["score"]: {
    update(entity, dt) {
      entity.timer += dt
    },

    press(entity, _, api) {
      if (entity.timer < 0.25) return

      startCountdown(entity, api)
    },
  },
})

/* eslint-disable no-magic-numbers */

import { v } from "@inglorious/utils/v.js"

const HALF = 2

export const WIDTH = 512
export const HEIGHT = 288

export const BACKGROUND_SPEED = 30
export const BACKGROUND_LOOP = 413

export const GROUND_HEIGHT = 16
export const GROUND_SPEED = 60
export const GROUND_LOOP = WIDTH

export const CEILING_MARGIN = 10

const BIRD_INSET = 8
const BIRD_HITBOX_INSET = 2
const BIRD_CRASH_OVERLAP = 1

export const BIRD_WIDTH = 38
export const BIRD_HEIGHT = 24
export const BIRD_SIZE = v(BIRD_WIDTH, BIRD_HEIGHT, 0)
export const BIRD_INITIAL_POSITION = v(
  WIDTH / HALF - BIRD_INSET + BIRD_WIDTH / HALF,
  HEIGHT / HALF + BIRD_INSET - BIRD_HEIGHT / HALF,
  0,
)
export const BIRD_HITBOX_SIZE = v(
  BIRD_WIDTH - BIRD_HITBOX_INSET * 2,
  BIRD_HEIGHT - BIRD_HITBOX_INSET * 2,
  0,
)
export const BIRD_GRAVITY = 980
export const BIRD_FLAP_SPEED = 300
// The bird is done for once its head sinks past the ground, which the original
// allows by a single pixel.
export const BIRD_CRASH_Y =
  GROUND_HEIGHT - BIRD_CRASH_OVERLAP + BIRD_HEIGHT / HALF

export const PIPE_WIDTH = 70
export const PIPE_HEIGHT = HEIGHT
export const PIPE_SIZE = v(PIPE_WIDTH, PIPE_HEIGHT, 0)
export const PIPE_SPEED = 60
export const PIPE_SPAWN_X = WIDTH + 32
export const GAP_HEIGHT = 90
// `GAP_Y` is the altitude of the lower edge of the gap, i.e. where the pipe
// hanging from the ceiling ends.
export const MIN_GAP_Y = GAP_HEIGHT
export const MAX_GAP_Y = HEIGHT - CEILING_MARGIN
export const PIPE_SPAWN_INTERVAL = 2
export const GAP_Y_SPREAD = 20
export const INITIAL_GAP_Y = HEIGHT - CEILING_MARGIN * 2
export const INITIAL_GAP_Y_SPREAD = 80

export const COUNTDOWN_TIME = 0.75
export const COUNTDOWN_START = 3

// Swallows the press that was already on its way when the bird crashed, so that
// dying and restarting cannot happen on the very same frame.
export const SCORE_GRACE_TIME = 0.25

export const GAME_STATE = {
  title: "title",
  countdown: "countdown",
  play: "play",
  score: "score",
}

export const PRESS = "press"

export const FONT_FAMILY = "'Flappy'"
export const FONT_SMALL_FAMILY = "'Fifty Bird'"
export const FONT_SIZE_SMALL = 8
export const FONT_SIZE_MEDIUM = 14
export const FONT_SIZE_LARGE = 28
export const FONT_SIZE_HUGE = 56

export const COLOR_TEXT = "white"

export const LAYER_BACKGROUND = -3
export const LAYER_PIPES = -2
export const LAYER_BIRD = -1
export const LAYER_GROUND = 0
export const LAYER_TEXT = 1
export const LAYER_OVERLAY = 2

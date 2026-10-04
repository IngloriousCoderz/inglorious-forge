import { ZERO_VECTOR } from "@inglorious/utils/math/vectors"
import { v } from "@inglorious/utils/v.js"

const HALF = 2
const SIDES = 2

/**
 * The game is played on a single plane: sprites have no depth, and only the
 * background, ground and pipes move sideways. Taken from `ZERO_VECTOR` so these
 * cannot drift away from it.
 */
const [NO_OFFSET, NO_RISE, NO_DEPTH] = ZERO_VECTOR
export { NO_DEPTH, NO_OFFSET, NO_RISE }

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
export const BIRD_SIZE = v(BIRD_WIDTH, BIRD_HEIGHT, NO_DEPTH)
export const BIRD_INITIAL_POSITION = v(
  WIDTH / HALF - BIRD_INSET + BIRD_WIDTH / HALF,
  HEIGHT / HALF + BIRD_INSET - BIRD_HEIGHT / HALF,
  NO_DEPTH,
)
export const BIRD_HITBOX_SIZE = v(
  BIRD_WIDTH - BIRD_HITBOX_INSET * SIDES,
  BIRD_HEIGHT - BIRD_HITBOX_INSET * SIDES,
  NO_DEPTH,
)
export const BIRD_GRAVITY = 980
export const BIRD_FLAP_SPEED = 300
// The bird is done for once its head sinks past the ground, which the original
// allows by a single pixel.
export const BIRD_CRASH_Y =
  GROUND_HEIGHT - BIRD_CRASH_OVERLAP + BIRD_HEIGHT / HALF

export const PIPE_WIDTH = 70
export const PIPE_HEIGHT = HEIGHT
export const PIPE_SIZE = v(PIPE_WIDTH, PIPE_HEIGHT, NO_DEPTH)
export const PIPE_SPEED = 60
// Pipes enter from just beyond the right edge of the screen.
const PIPE_SPAWN_MARGIN = 32
export const PIPE_SPAWN_X = WIDTH + PIPE_SPAWN_MARGIN
export const GAP_HEIGHT = 90
// `GAP_Y` is the altitude of the lower edge of the gap, i.e. where the pipe
// hanging from the ceiling ends.
export const MIN_GAP_Y = GAP_HEIGHT
export const MAX_GAP_Y = HEIGHT - CEILING_MARGIN
export const PIPE_SPAWN_INTERVAL = 2
export const GAP_Y_SPREAD = 20
export const INITIAL_GAP_Y = HEIGHT - CEILING_MARGIN * SIDES
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

// Text sits a margin down from the top of the screen, so the margins are measured
// as altitudes instead.
const NO_TEXT_MARGIN = 8
const TITLE_TEXT_MARGIN = 64
const PROMPT_TEXT_MARGIN = 100
const COUNTDOWN_TEXT_MARGIN = 120
const GAME_OVER_PROMPT_TEXT_MARGIN = 160
const FPS_TEXT_MARGIN = 10

export const SCORE_TEXT_X = NO_TEXT_MARGIN
export const SCORE_TEXT_ALTITUDE = HEIGHT - NO_TEXT_MARGIN
export const TITLE_TEXT_ALTITUDE = HEIGHT - TITLE_TEXT_MARGIN
export const PROMPT_TEXT_ALTITUDE = HEIGHT - PROMPT_TEXT_MARGIN
export const COUNTDOWN_TEXT_ALTITUDE = HEIGHT - COUNTDOWN_TEXT_MARGIN
export const GAME_OVER_TEXT_ALTITUDE = HEIGHT - TITLE_TEXT_MARGIN
export const GAME_OVER_SCORE_TEXT_ALTITUDE = HEIGHT - PROMPT_TEXT_MARGIN
export const GAME_OVER_PROMPT_TEXT_ALTITUDE =
  HEIGHT - GAME_OVER_PROMPT_TEXT_MARGIN
export const FPS_TEXT_X = WIDTH - FPS_TEXT_MARGIN
export const FPS_TEXT_ALTITUDE = HEIGHT - FPS_TEXT_MARGIN

export const LAYER_BACKGROUND = -3
export const LAYER_PIPES = -2
export const LAYER_BIRD = -1
export const LAYER_GROUND = 0
export const LAYER_TEXT = 1
export const LAYER_OVERLAY = 2

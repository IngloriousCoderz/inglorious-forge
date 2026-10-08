import { ZERO_VECTOR } from "@inglorious/utils/math/vector"

// The game is played on a single plane: sprites have no depth, and only the
// background, ground and pipes move sideways.
const [NO_OFFSET, NO_RISE, NO_DEPTH] = ZERO_VECTOR
export { NO_DEPTH, NO_OFFSET, NO_RISE }

export const HEIGHT = 288

export const CEILING_MARGIN = 10

export const BIRD_WIDTH = 38
export const INITIAL_GAP_Y = HEIGHT - CEILING_MARGIN * 2
export const COUNTDOWN_START = 3

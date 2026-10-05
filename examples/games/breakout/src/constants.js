/**
 * Taken from the original where it names something itself. Everything else stays a
 * number in place: a name per digit costs a line to read and a line to keep in sync
 * without saying anything the position around it does not already say.
 */
export const WIDTH = 432
export const HEIGHT = 243

export const PADDLE_WIDTH = 64
export const PADDLE_HEIGHT = 16
export const PADDLE_SPEED = 200
export const PADDLE_START_X = WIDTH / 2 - 32
// The original puts the paddle's top at VIRTUAL_HEIGHT - 32, an altitude of 32, so it
// hangs down from there and leaves a paddle's own height of floor beneath it.
export const PADDLE_ALTITUDE = PADDLE_HEIGHT * 2

// The original draws every sprite from its top left corner, which in a world counting
// up from the floor is a top-left anchor.
export const LEFT_EDGE = 0
export const TOP_EDGE = 1

// The ball is square and small, and it is served from just above the paddle.
export const BALL_SIZE = 8
export const BALL_START_X = WIDTH / 2 - 4
// The original serves it from VIRTUAL_HEIGHT - 42, which is an altitude of 42.
export const BALL_START_ALTITUDE = 42

// The bricks, which the level makes at random.
export const BRICK_WIDTH = 32
export const BRICK_HEIGHT = 16
export const BRICK_MIN_ROWS = 1
export const BRICK_MAX_ROWS = 5
export const BRICK_MIN_COLS = 7
export const BRICK_MAX_COLS = 13
// The screen is padded so that the widest level still leaves a brick's half-width on
// each side, which is what the level's own arithmetic below relies on.
export const BRICK_PADDING = 8
export const BRICK_MAX_COLUMN_PADDING = 16

export const GAME_STATE = {
  start: "start",
  play: "play",
  paused: "paused",
}

export const MENU_ITEMS = ["start", "high-scores"]
export const MENU_START = MENU_ITEMS[0]
export const MENU_HIGH_SCORES = MENU_ITEMS[1]

// The keys, as the behaviours name the events they answer to.
export const PRESS = "press"
export const PRESS_MENU_UP = "pressMenuUp"
export const PRESS_MENU_DOWN = "pressMenuDown"
export const TOGGLE_PAUSE = "togglePause"

// The sounds the original plays. Moving between menu items reuses the paddle hit
// rather than a select sound of its own, which is what the original does.
export const SOUND_PADDLE_HIT = "paddleHit"
export const SOUND_CONFIRM = "confirm"
export const SOUND_PAUSE = "pause"
export const SOUND_WALL_HIT = "wallHit"
export const SOUND_BRICK_HIT = "brickHit"

export const FONT_FAMILY = "'Breakout'"

// The colour the original picks a menu item out with.
export const COLOR_TEXT = "white"
export const COLOR_HIGHLIGHT = "rgb(103, 255, 255)"

export const LAYER_BACKGROUND = -1
export const LAYER_PADDLE = 1
export const LAYER_BRICK = 0
export const LAYER_BALL = 2
export const LAYER_TEXT = 3
export const LAYER_OVERLAY = 4

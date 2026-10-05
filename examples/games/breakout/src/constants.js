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

export const FONT_FAMILY = "'Breakout'"

// The colour the original picks a menu item out with.
export const COLOR_TEXT = "white"
export const COLOR_HIGHLIGHT = "rgb(103, 255, 255)"

export const LAYER_BACKGROUND = -1
export const LAYER_PADDLE = 1
export const LAYER_TEXT = 2
export const LAYER_OVERLAY = 3

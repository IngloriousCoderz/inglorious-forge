import { ZERO_VECTOR } from "@inglorious/utils/math/vectors"

const THIRD = 3
const HALF = 2
const ONE = 1
const PADDLE_FRAME_ROW = 4
const PADDLE_WIDTHS = 32
const PADDLE_TILE_WIDTH = 32
const PADDLE_TILE_HEIGHT = 16
const START_OFFSET = 70
const HIGH_SCORES_OFFSET = 90

export const FIRST_ITEM = 0
export const NEXT_ITEM = 1

/**
 * The game is played on a single plane: nothing has depth and nothing rises on its
 * own. Taken from `ZERO_VECTOR` so these cannot drift away from it.
 */
const [NO_OFFSET, NO_RISE, NO_DEPTH] = ZERO_VECTOR
export { NO_DEPTH, NO_OFFSET, NO_RISE }

// The window is whatever the browser gives us; the game is composed for a fixed
// virtual screen and scaled to fit, the way the original does it.
export const WIDTH = 432
export const HEIGHT = 243

export const FONT_FAMILY = "'Breakout'"
export const FONT_SIZE_SMALL = 8
export const FONT_SIZE_MEDIUM = 16
export const FONT_SIZE_LARGE = 32

export const COLOR_TEXT = "white"
// The colour the original picks a menu item out with.
export const COLOR_HIGHLIGHT = "rgb(103, 255, 255)"

// The backdrop is smaller than the screen and not the same shape as it, so it is
// stretched on each axis to fill.
const BACKGROUND_X = 0
const BACKGROUND_Y = 1

// The measured pixel size of background.png. It is not the screen's aspect ratio,
// so it gets stretched rather than scaled as a whole.
const BACKGROUND_PIXEL_WIDTH = 302
const BACKGROUND_PIXEL_HEIGHT = 129

// Its last row and last column are fully transparent, so the artwork is one pixel
// smaller on each axis than the file claims. Both the size and the scale have to
// account for that, or the transparent edge is stretched across the screen and its
// floor colour is smeared into the bar that was meant to be drawn underneath it.
export const BACKGROUND_SIZE = [
  BACKGROUND_PIXEL_WIDTH - ONE,
  BACKGROUND_PIXEL_HEIGHT - ONE,
]
export const BACKGROUND_SCALE = [
  WIDTH / BACKGROUND_SIZE[BACKGROUND_X],
  HEIGHT / BACKGROUND_SIZE[BACKGROUND_Y],
]

/**
 * The original lays its text out from the top of the screen, but this world counts
 * up from the bottom, so each altitude is the screen height less the original's y.
 * Taking them straight from the original would stack the menu upside down.
 */
export const TITLE_ALTITUDE = HEIGHT - HEIGHT / THIRD
export const START_ALTITUDE = HEIGHT - (HEIGHT / HALF + START_OFFSET)
export const HIGH_SCORES_ALTITUDE =
  HEIGHT - (HEIGHT / HALF + HIGH_SCORES_OFFSET)

// The paddle, which slides along the floor under held arrow keys.
export const PADDLE_WIDTH = 64
export const PADDLE_HEIGHT = 16
export const PADDLE_SPEED = 200
export const PADDLE_START_X = WIDTH / HALF - PADDLE_WIDTH / HALF
// The original sits the paddle a paddle's own height above the floor: its top edge
// is at VIRTUAL_HEIGHT - 32, which is an altitude of 32, leaving 16 below it.
export const PADDLE_ALTITUDE = PADDLE_HEIGHT
export const LEFT_EDGE = 0
export const BOTTOM_EDGE = 0

export const GAME_STATE = {
  start: "start",
  play: "play",
  paused: "paused",
}

export const MENU_ITEMS = ["start", "high-scores"]
export const MENU_START = MENU_ITEMS[FIRST_ITEM]
export const MENU_HIGH_SCORES = MENU_ITEMS[NEXT_ITEM]

export const PRESS = "press"
export const PRESS_MENU_UP = "pressMenuUp"
export const PRESS_MENU_DOWN = "pressMenuDown"
export const PRESS_BACK = "pressBack"
export const PAUSE = "pause"

// The paddle is cropped out of the shared atlas rather than drawn as a shape.
//
// `renderImage` multiplies `sx`/`sy` by `tileSize`, so those are tile indices on
// the atlas's own 32x16 grid, not pixels. The 64 wide paddle is the second frame of
// the blue band, which starts one whole 32 wide paddle in.
//
// The frame is wider than one cell, so it also covers the cell after it. `frameSize`
// is how much of the sheet gets read, which is what lets a frame cross a cell
// boundary; without it the renderer only ever reads one whole tile.
const PADDLE_TILE_X = PADDLE_WIDTHS / PADDLE_TILE_WIDTH
const PADDLE_TILE_Y = PADDLE_FRAME_ROW

export const PADDLE_TILE_SIZE = [PADDLE_TILE_WIDTH, PADDLE_TILE_HEIGHT]
export const PADDLE_TILE = [PADDLE_TILE_X, PADDLE_TILE_Y]
// The frame is the whole cell, padding included: the original draws it as a 64x16
// quad and the padding is part of that sprite.
export const PADDLE_FRAME_SIZE = [PADDLE_WIDTH, PADDLE_HEIGHT]
export const ATLAS_ID = "breakout"

const HALF_HEIGHT = HEIGHT / HALF

export const PAUSED_ALTITUDE = HALF_HEIGHT - FONT_SIZE_MEDIUM

export const LAYER_BACKGROUND = -1
export const LAYER_PADDLE = 1
export const LAYER_TEXT = 2
export const LAYER_OVERLAY = 3

export const PREVIOUS_ITEM = -1

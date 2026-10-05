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

// The original draws it at native size and scales by one pixel less than that, which
// overshoots the screen slightly on each axis. Taken as written rather than tidied
// up, so the backdrop lands where the original's does.
export const BACKGROUND_SIZE = [BACKGROUND_PIXEL_WIDTH, BACKGROUND_PIXEL_HEIGHT]
export const BACKGROUND_SCALE = [
  WIDTH / (BACKGROUND_SIZE[BACKGROUND_X] - ONE),
  HEIGHT / (BACKGROUND_SIZE[BACKGROUND_Y] - ONE),
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
// The original puts the paddle's centre at VIRTUAL_HEIGHT - 32, which is an altitude
// of 32, leaving a full paddle height of floor beneath it.
const PADDLES_HIGH = 2

const FLOOR_CLEARANCE = PADDLES_HIGH * PADDLE_HEIGHT

export const PADDLE_ALTITUDE = FLOOR_CLEARANCE
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

// The sounds the original plays, named as it registers them. Moving between menu
// items reuses the paddle hit rather than a select sound of its own.
export const SOUND_PADDLE_HIT = "paddleHit"
export const SOUND_CONFIRM = "confirm"
export const SOUND_PAUSE = "pause"

const HALF_HEIGHT = HEIGHT / HALF

// The original centres 'PAUSED' on VIRTUAL_HEIGHT / 2 - 16 with printf, which
// centres a block vertically. Text here hangs off its top edge, so it has to drop by
// half a font to land where the original's does.
export const PAUSED_ALTITUDE =
  HEIGHT - (HALF_HEIGHT - FONT_SIZE_MEDIUM) - FONT_SIZE_LARGE / HALF

export const LAYER_BACKGROUND = -1
export const LAYER_PADDLE = 1
export const LAYER_TEXT = 2
export const LAYER_OVERLAY = 3

export const PREVIOUS_ITEM = -1

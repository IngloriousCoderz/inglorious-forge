/**
 * Taken from the original where it names something itself. Everything else stays a
 * number in place: a name per digit costs a line to read and a line to keep in sync
 * without saying anything the position around it does not already say.
 */
export const WIDTH = 432
export const HEIGHT = 243

export const PADDLE_WIDTH = 64
export const PADDLE_HEIGHT = 16

export const FIRST_PADDLE_SKIN = 1
export const LAST_PADDLE_SKIN = 4

// The original draws every sprite from its top left corner, which in a world counting
// up from the floor is a top-left anchor.
export const LEFT_EDGE = 0
export const TOP_EDGE = 1

// The ball is square and small, and it is served from just above the paddle.
export const BALL_SIZE = 8

// The bricks, which the level makes at random.
export const BRICK_WIDTH = 32
export const BRICK_HEIGHT = 16
export const BRICK_MAX_COLS = 13

// How many hits a brick is worth, and therefore where on the sheet it is drawn: the bricks
// run five colours across each of four tiers, in one unbroken sequence from the plain blue
// one at the top of the sheet to the hardest. A brick carries how many hits are left in it
// rather than a colour and a tier, so that being knocked back is losing one and there is
// no ordering to get wrong.
export const BRICK_COLORS_PER_TIER = 5
export const BRICK_FIRST_COLOR = 1
export const BRICK_FIRST_TIER = 0

// The original splits the game in four now: a start screen, the wait before each serve,
// the play itself, and the end. Pausing is still not one of them -- it is a flag on the
// play state, exactly as before. Those screens are the keys of the state map, and a state
// is named by the string it is given, so the names live where they are read.

// Lives, which the serve screen carries across between serves.
export const MAX_HEALTH = 3

// The three font sizes the original names small, medium and large.
export const FONT_SMALL = 8
export const FONT_MEDIUM = 16
export const FONT_LARGE = 32

// The health readout, which is three hearts along the top right: a full one for each
// life still in hand, then an empty one for each life spent.
export const HEART_WIDTH = 10
export const HEART_HEIGHT = 9

// The items on the start menu, in the order they are walked through.
export const MENU_ITEMS = ["start", "high-scores"]

// One row of two, each a cell wide.
export const ARROWS_SHEET = [48, 24]
export const LEFT_ARROW = 0
export const ARROW_SIZE = 24

export const LAYER_BRICK = 0

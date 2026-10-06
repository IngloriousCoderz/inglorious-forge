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

// Each brick hit quickens the ball very slightly, and this is as quick as it is allowed
// to get. The ceiling arrived with the levels: a level is meant to be harder than the
// last because of the bricks in it, and a ball too quick to reach them is harder to play
// rather than harder to beat.
export const BRICK_BOUNCE_Y = 1.02
export const BALL_MAX_VERTICAL_SPEED = 150

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

// How many hits a brick is worth, and therefore where on the sheet it is drawn: the bricks
// run five colours across each of four tiers, in one unbroken sequence from the plain blue
// one at the top of the sheet to the hardest. A brick carries how many hits are left in it
// rather than a colour and a tier, so that being knocked back is losing one and there is
// no ordering to get wrong.
export const BRICK_COLORS_PER_TIER = 5
export const BRICK_FIRST_COLOR = 1
export const BRICK_FIRST_TIER = 0
export const BRICK_MAX_COLOR = 5
export const BRICK_MAX_TIER = 3
export const BRICK_TIERS_PER_COLOR = 4
export const BRICK_MAX_HP =
  BRICK_MAX_TIER * BRICK_COLORS_PER_TIER + BRICK_MAX_COLOR

// The level says how far along the colours and tiers a level may reach. Every fifth
// level unlocks the next tier, and the colours climb one per level within each group of
// five -- both of which stop, so that a late level cannot ask for a frame that is not on
// the sheet.
export const LEVELS_PER_TIER = 5
export const COLOR_BASE = 3

// The original splits the game in four now: a start screen, the wait before each serve,
// the play itself, and the end. Pausing is still not one of them -- it is a flag on the
// play state, exactly as before.
export const GAME_STATE = {
  start: "start",
  serve: "serve",
  play: "play",
  victory: "victory",
  highScores: "highScores",
  gameOver: "gameOver",
}

// Lives, which the serve screen carries across between serves.
export const MAX_HEALTH = 3

// What a brick is worth. A brick scores by the tier and the colour it had when it was
// hit, so a harder brick is worth knocking down rather than one hit to clear.
export const BRICK_TIER_SCORE = 200
export const BRICK_COLOR_SCORE = 25

// The original picks one of seven ball skins at random on every serve.
export const BALL_SKIN_FIRST_ROW = 4

// The ball loses a life by falling below the floor, which is an altitude of nothing.
// Kept as a name so the check reads as what it is.
export const FLOOR = 0
export const BALL_SKIN_COUNT = 7

// The three font sizes the original names small, medium and large.
export const FONT_SMALL = 8
export const FONT_MEDIUM = 16
export const FONT_LARGE = 32

// The readout along the top right: a heart for each life in hand, then the label, then
// the number. The original hangs its hearts a pixel above its text and prints its number
// half a font above its own label, both of which read as a misalignment rather than a
// decision, so all three are lined up on the one row here.
export const SCORE_LABEL_X = WIDTH - 60
export const SCORE_VALUE_BOX = 40
export const SCORE_VALUE_X = WIDTH - 50 + SCORE_VALUE_BOX
export const SCORE_TOP = 5
// A text entity is anchored by the top edge of its line, so an altitude says where the
// line begins rather than where it ends.
export const SCORE_ALTITUDE = HEIGHT - SCORE_TOP

// The health readout, which is three hearts along the top right: a full one for each
// life still in hand, then an empty one for each life spent.
export const HEART_WIDTH = 10
export const HEART_HEIGHT = 9
export const HEART_START_X = WIDTH - 100
export const HEART_ALTITUDE = SCORE_ALTITUDE
export const HEART_SPACING = 11

export const MENU_ITEMS = ["start", "high-scores"]
export const MENU_START = MENU_ITEMS[0]
export const MENU_HIGH_SCORES = MENU_ITEMS[1]

// The keys, as the behaviours name the events they answer to.
export const PRESS = "press"
// Escape quits, and it does so from every state rather than from the play alone: the
// original checks it in all four, so a way out is never behind a particular screen. The
// engine turns this into the loop stopping, so there is no state that has to handle it.
export const QUIT = "quit"
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
// A brick takes several hits now, and this is the sound of the last of them.
export const SOUND_BRICK_BROKEN = "brickBroken"
// And this is the sound of a level being finished.
export const SOUND_VICTORY = "victory"
export const SOUND_HURT = "hurt"

export const FONT_FAMILY = "'Breakout'"

// The frame rate has no counterpart in the original, which has no counter at all. It goes
// in the bottom left, the one corner the play never draws in: the paddle stops an
// entity's own height above the floor, and the bottom right belongs to the score.
export const FPS_MARGIN = 4
export const FPS_SIZE = 8
// Also anchored by its top edge, so it sits a margin and a line below the ceiling.
export const FPS_ALTITUDE = HEIGHT - FPS_MARGIN - FPS_SIZE

// The colour the original picks a menu item out with.
export const COLOR_TEXT = "white"
export const COLOR_HIGHLIGHT = "rgb(103, 255, 255)"

// The debris a brick throws off is drawn after the bricks and before the paddle, which
// is where the original puts it. A layer is a number and nothing else, so a brick's and a
// paddle's can be told apart by sitting between them rather than by one of them moving.
export const LAYER_BACKGROUND = -1
export const LAYER_BRICK = 0
export const LAYER_PARTICLE = 0.5
export const LAYER_PADDLE = 1
export const LAYER_BALL = 2
export const LAYER_TEXT = 3
export const LAYER_OVERLAY = 4

// The colours of the five bricks on the sheet, which the debris of a knocked brick is
// coloured to match. These are the original's own values rather than anything read off
// the artwork, which is what a particle needs: it is drawn in the brick's colour, not in
// the colour of the pixels that happen to be there.
export const BRICK_COLORS = {
  1: "rgb(99, 155, 255)",
  2: "rgb(106, 190, 47)",
  3: "rgb(217, 87, 99)",
  4: "rgb(215, 123, 186)",
  5: "rgb(251, 242, 54)",
}

// What a knocked brick throws off, and how it falls. The acceleration is given between
// two corners and each particle's own is drawn from between them, which is what makes
// the burst look scattered rather than like a grid.
export const PARTICLE_COUNT = 64
export const PARTICLE_SIZE = 8
export const PARTICLE_LIFETIME = [0.5, 1]
export const PARTICLE_SPREAD = 10
export const PARTICLE_ACCELERATION_FALL = 80
export const PARTICLE_ACCELERATION_SIDEWAYS = 15
// How opaque the debris starts, per tier. The original works in eight-bit alpha and this
// is that number divided by 255; the debris fades out over its own lifetime either way.
export const PARTICLE_ALPHA_PER_TIER = 55 / 255

export const EMPTY = null

export const CELL_SIZE = 5
export const SCREEN_WIDTH = 1040
export const SCREEN_HEIGHT = 600

export const BOARD_ROWS = 80
export const BOARD_COLUMNS = 120
export const BOARD_PIXEL_WIDTH = BOARD_COLUMNS * CELL_SIZE
export const BOARD_PIXEL_HEIGHT = BOARD_ROWS * CELL_SIZE
// Over on the left rather than in the middle, because the right of the screen is where
// the controls live: a centred board would leave two half-useless strips instead of one
// panel with room for a label, a track and a number on every row.
export const BOARD_X = 20
export const BOARD_Z = (SCREEN_HEIGHT + BOARD_PIXEL_HEIGHT) / 2

// Life on a board is a game of seconds rather than frames: a generation a second is
// fast enough to watch a pattern change and slow enough to follow what changed it.
export const FPS = 10

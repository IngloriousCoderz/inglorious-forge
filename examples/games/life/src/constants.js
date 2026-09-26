export const EMPTY = null
export const FOX = "Fox"
export const RABBIT = "Rabbit"
export const ROW = 0
export const COLUMN = 1
export const ZERO = 0
export const ONE = 1
export const TWO = 2
export const NINE = 9
export const FIFTEEN = 15
export const PERCENT = 100

export const BOARD_ROWS = 80
export const BOARD_COLUMNS = 120
export const CELL_SIZE = 5
export const SCREEN_WIDTH = 800
export const SCREEN_HEIGHT = 600
export const BOARD_PIXEL_WIDTH = BOARD_COLUMNS * CELL_SIZE
export const BOARD_PIXEL_HEIGHT = BOARD_ROWS * CELL_SIZE
export const BOARD_X = (SCREEN_WIDTH - BOARD_PIXEL_WIDTH) / TWO
export const BOARD_Z = (SCREEN_HEIGHT + BOARD_PIXEL_HEIGHT) / TWO
export const FPS = 10

export const FOX_INITIAL_PERCENTAGE = 2
export const RABBIT_INITIAL_PERCENTAGE = 8
export const FOX_INITIAL_THRESHOLD = FOX_INITIAL_PERCENTAGE / PERCENT
export const INITIAL_ANIMAL_THRESHOLD =
  (FOX_INITIAL_PERCENTAGE + RABBIT_INITIAL_PERCENTAGE) / PERCENT

export const FOX_COLOR = "rgb(224, 82, 45)"
export const RABBIT_COLOR = "rgb(220, 220, 220)"

export const SPECIES = {
  [FOX]: {
    initialEnergy: 2,
    energyDecay: 1,
    energyGain: 4,
    breedingAge: 10,
    maxAge: 150,
    reproductionProbability: NINE / PERCENT,
    maxLitter: 3,
  },
  [RABBIT]: {
    initialEnergy: 0,
    energyDecay: 0,
    energyGain: 0,
    breedingAge: 5,
    maxAge: 50,
    reproductionProbability: FIFTEEN / PERCENT,
    maxLitter: 5,
  },
}

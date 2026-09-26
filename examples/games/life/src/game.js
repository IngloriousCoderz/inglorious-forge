import { v } from "@inglorious/utils"

import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  FPS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  ZERO,
} from "./constants.js"
import { createGrid, createInitialAnimals } from "./grid.js"
import { createFox } from "./types/fox.js"
import { createRabbit } from "./types/rabbit.js"

const grid = createGrid()
const initialAnimals = createInitialAnimals(grid)
const Fox = createFox(grid)
const Rabbit = createRabbit(grid)
const Board = {}

export default {
  updateStrategy: "full-clone",
  loop: { type: "fixed", fps: FPS },

  types: {
    Board,
    Fox,
    Rabbit,
  },

  entities: {
    game: {
      type: "Game",
      devMode: false,
      pixelated: true,
      size: [SCREEN_WIDTH, SCREEN_HEIGHT],
      backgroundColor: "rgb(16, 24, 32)",
    },

    board: {
      type: "Board",
      rows: BOARD_ROWS,
      columns: BOARD_COLUMNS,
      position: v(ZERO, ZERO, ZERO),
    },

    ...initialAnimals,
  },
}

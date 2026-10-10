import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  FPS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "./constants.js"

const Board = {}

/**
 * The part of the game that is the same whichever world is running.
 *
 * Everything that differs between worlds -- what stands on the board, what a generation
 * means, how a thing is drawn -- is handed in. This keeps the parts that have nothing to
 * do with the rules in one place, so that adding a world is a matter of describing it
 * rather than of copying the engine setup.
 */
export function createLifeGame({ systems = [], types, entities }) {
  return {
    updateStrategy: "full-clone",
    loop: { type: "fixed", fps: FPS },

    systems,

    types: {
      Board,
      ...types,
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
        position: [0, 0, 0],
      },

      ...entities,
    },
  }
}

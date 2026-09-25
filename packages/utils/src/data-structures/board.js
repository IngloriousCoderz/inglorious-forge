/**
 * Default filler function for board cells.
 * @returns {null} Default value for a cell.
 */
const DEFAULT_FILLER = () => null

/**
 * Default function to convert a cell to a string.
 * @param {*} cell - The cell value.
 * @returns {string} String representation of the cell.
 */
const DEFAULT_CELL_TO_STRING = (cell) => `${cell}`

const FIRST_ROW = 0
const FIRST_COLUMN = 0
const LAST_ROW_OFFSET = 1
const LAST_COLUMN_OFFSET = 1
const MOVE_DOWN = 1
const MOVE_LEFT = -1
const MOVE_RIGHT = 1
const MOVE_UP = -1
const NO_STEP = 0

const NEIGHBOR_OFFSETS = [
  [MOVE_UP, MOVE_LEFT],
  [MOVE_UP, NO_STEP],
  [MOVE_UP, MOVE_RIGHT],
  [NO_STEP, MOVE_LEFT],
  [NO_STEP, MOVE_RIGHT],
  [MOVE_DOWN, MOVE_LEFT],
  [MOVE_DOWN, NO_STEP],
  [MOVE_DOWN, MOVE_RIGHT],
]

/**
 * Calculates the index in a one-dimensional array for given row and column.
 * @param {number} row - The row index.
 * @param {number} column - The column index.
 * @param {number} columns - The total number of columns.
 * @returns {number} The calculated index.
 */
function getIndex(row, column, columns) {
  return row * columns + column
}

/**
 * Creates a 1D board with the specified dimensions and fills it using the provided filler function.
 * @param {[number, number]} dimensions - Array containing the number of rows and columns.
 * @param {Function} [filler=DEFAULT_FILLER] - Function to fill each cell of the board.
 * @returns {any[]} The created board.
 */
export function createBoard([rows, columns], filler = DEFAULT_FILLER) {
  return new Array(rows * columns).fill(null).map((_, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns
    return filler(row, column)
  })
}

/**
 * Moves the given coordinates one step down.
 * @param {[number, number]} coords - The current coordinates [row, column].
 * @param {[number]} size - Array containing the number of rows.
 * @returns {[number, number]} The new coordinates after moving down.
 * @throws {Error} If the movement goes out of bounds.
 */
export function down([i, j], [rows]) {
  if (i === rows - LAST_ROW_OFFSET) {
    throw new Error()
  }
  return [i + MOVE_DOWN, j]
}

/**
 * Moves the given coordinates one step down and one step left.
 * @param {[number, number]} coords - The current coordinates [row, column].
 * @param {[number, number]} size - Array containing the number of rows and columns.
 * @returns {[number, number]} The new coordinates after moving down-left.
 */
export function downLeft(coords, size) {
  return down(left(coords, size), size)
}

/**
 * Moves the given coordinates one step down and one step right.
 * @param {[number, number]} coords - The current coordinates [row, column].
 * @param {[number, number]} size - Array containing the number of rows and columns.
 * @returns {[number, number]} The new coordinates after moving down-right.
 */
export function downRight(coords, size) {
  return down(right(coords, size), size)
}

/**
 * Moves the given coordinates one step left.
 * @param {[number, number]} coords - The current coordinates [row, column].
 * @returns {[number, number]} The new coordinates after moving left.
 * @throws {Error} If the movement goes out of bounds.
 */
export function left([i, j]) {
  if (j === FIRST_COLUMN) {
    throw new Error()
  }
  return [i, j + MOVE_LEFT]
}

/**
 * Returns the coordinates neighboring the given coordinates that fall within the board.
 * @param {[number, number]} coords - The coordinates [row, column].
 * @param {[number, number]} size - Array containing the number of rows and columns.
 * @returns {[number, number][]} The neighboring coordinates within the board.
 */
export function neighbors([i, j], [rows, columns]) {
  return NEIGHBOR_OFFSETS.map(([rowOffset, columnOffset]) => [
    i + rowOffset,
    j + columnOffset,
  ]).filter(
    ([row, column]) =>
      row >= FIRST_ROW &&
      row < rows &&
      column >= FIRST_COLUMN &&
      column < columns,
  )
}

/**
 * Moves the given coordinates one step right.
 * @param {[number, number]} coords - The current coordinates [row, column].
 * @param {[number, number]} size - Array containing the number of rows and columns.
 * @returns {[number, number]} The new coordinates after moving right.
 * @throws {Error} If the movement goes out of bounds.
 */
export function right([i, j], [, columns]) {
  if (j === columns - LAST_COLUMN_OFFSET) {
    throw new Error()
  }
  return [i, j + MOVE_RIGHT]
}

/**
 * Converts the board to a string representation.
 * @param {any[]} board - The 1D board to convert.
 * @param {[number, number]} dimensions - Array containing the number of rows and columns.
 * @param {Function} [cellToString=DEFAULT_CELL_TO_STRING] - Function to convert each cell to a string.
 * @returns {string} The string representation of the board.
 */
export function toString(
  board,
  [rows, columns],
  cellToString = DEFAULT_CELL_TO_STRING,
) {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: columns }, (_, j) =>
      cellToString(board[getIndex(i, j, columns)], i, j),
    ).join(" "),
  ).join("\n")
}

/**
 * Moves the given coordinates one step up.
 * @param {[number, number]} coords - The current coordinates [row, column].
 * @returns {[number, number]} The new coordinates after moving up.
 * @throws {Error} If the movement goes out of bounds.
 */
export function up([i, j]) {
  if (i === FIRST_ROW) {
    throw new Error()
  }
  return [i + MOVE_UP, j]
}

/**
 * Moves the given coordinates one step up and one step left.
 * @param {[number, number]} coords - The current coordinates [row, column].
 * @param {[number, number]} size - Array containing the number of rows and columns.
 * @returns {[number, number]} The new coordinates after moving up-left.
 */
export function upLeft(coords, size) {
  return up(left(coords, size), size)
}

/**
 * Moves the given coordinates one step up and one step right.
 * @param {[number, number]} coords - The current coordinates [row, column].
 * @param {[number, number]} size - Array containing the number of rows and columns.
 * @returns {[number, number]} The new coordinates after moving up-right.
 */
export function upRight(coords, size) {
  return up(right(coords, size), size)
}

export type Coordinates = readonly [row: number, column: number]

export type CoordinatesResult = [row: number, column: number]

export type BoardSize = readonly [rows: number, columns: number]

export type VerticalBoardSize = readonly [rows: number, columns?: number]

export type Board<T> = T[]

export type BoardFiller<T> = (row: number, column: number) => T

export type CellToString<T> = (cell: T, row: number, column: number) => string

export type NeighborPredicate<T> = (cell: T) => boolean

/**
 * The axes that wrap around board edges. "horizontal" wraps the column axis,
 * "vertical" wraps the row axis, and "both" wraps each axis independently.
 */
export type Wrap = "horizontal" | "vertical" | "both"

export interface NeighborOptions {
  wrap?: Wrap
}

export interface CountNeighborsOptions<T> extends NeighborOptions {
  predicate?: NeighborPredicate<T>
}

/**
 * Counts the neighboring cells that satisfy a predicate.
 */
export function countNeighbors<T>(
  cells: readonly T[],
  coords: Coordinates,
  size: BoardSize,
  options?: CountNeighborsOptions<T>,
): number

/**
 * Returns the flat-board index for a row and column.
 */
export function getIndex(row: number, column: number, columns: number): number

/**
 * Creates a one-dimensional board and fills each cell using the given function.
 */
export function createBoard(dimensions: BoardSize, filler?: undefined): null[]

export function createBoard<T>(
  dimensions: BoardSize,
  filler: BoardFiller<T>,
): T[]

/**
 * Moves coordinates one step down.
 */
export function down(
  coords: Coordinates,
  size: VerticalBoardSize,
): CoordinatesResult

/**
 * Moves coordinates one step down and left.
 */
export function downLeft(
  coords: Coordinates,
  size: BoardSize,
): CoordinatesResult

/**
 * Moves coordinates one step down and right.
 */
export function downRight(
  coords: Coordinates,
  size: BoardSize,
): CoordinatesResult

/**
 * Moves coordinates one step left.
 */
export function left(coords: Coordinates, size?: BoardSize): CoordinatesResult

/**
 * Returns the coordinates neighboring a cell that fall within the board.
 */
export function neighbors(
  coords: Coordinates,
  size: BoardSize,
  options?: NeighborOptions,
): CoordinatesResult[]

/**
 * Moves coordinates one step right.
 */
export function right(coords: Coordinates, size: BoardSize): CoordinatesResult

/**
 * Converts a board to a string representation.
 */
export function toString<T>(
  board: Readonly<Board<T>>,
  dimensions: BoardSize,
  cellToString?: CellToString<T>,
): string

/**
 * Moves coordinates one step up.
 */
export function up(coords: Coordinates, size?: BoardSize): CoordinatesResult

/**
 * Moves coordinates one step up and left.
 */
export function upLeft(coords: Coordinates, size: BoardSize): CoordinatesResult

/**
 * Moves coordinates one step up and right.
 */
export function upRight(coords: Coordinates, size: BoardSize): CoordinatesResult

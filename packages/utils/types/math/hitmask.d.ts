import type { Point } from "./point"
import type { Platform } from "./rectangle"

/** Represents the width and depth of a hitmask tile. */
export type TileSize = readonly [width: number, depth: number]

/** Represents a tiled collision mask. */
export interface Hitmask {
  /** The center of the hitmask. */
  position: Point
  /** The dimensions of each tile. */
  tileSize: TileSize
  /** The number of tile columns. */
  columns: number
  /** The height of each tile. */
  heights: number[]
}

/** Checks whether a platform collides with a hitmask. */
export function findCollisions(hitmask: Hitmask, target: Platform): boolean

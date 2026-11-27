import type { Entity } from "@inglorious/engine"

export interface HitmaskEntity extends Entity {
  tileSize: readonly [width: number, height: number]
  columns: number
  /** Each tile's height, tinted from red (highest) to blue (lowest). */
  heights: number[]
}

/** Draws a hitmask's heights over the tiles, for debugging. */
export function renderHitmask(
  entity: HitmaskEntity,
  ctx: CanvasRenderingContext2D,
): void

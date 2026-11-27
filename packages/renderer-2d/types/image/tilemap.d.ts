import type { Entity, GameApi } from "@inglorious/engine"

import type { ImageParams } from "./image"

export interface TilemapEntity extends Entity {
  tilemap: {
    image: ImageParams & { tileSize: readonly [width: number, height: number] }
    columns: number
    scale?: number
    /** Each layer's tiles, as indices on the sheet; see `flippedHorizontally`. */
    layers: { tiles: number[] }[]
  }
}

/** Draws the tilemap's layers, centred on its position. */
export function renderTilemap(
  entity: TilemapEntity,
  ctx: CanvasRenderingContext2D,
  api: GameApi,
): void

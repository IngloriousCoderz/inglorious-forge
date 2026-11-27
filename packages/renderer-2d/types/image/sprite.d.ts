import type { SpriteState } from "@inglorious/engine/animation/sprite.js"
import type { Entity, GameApi } from "@inglorious/engine"

import type { ImageParams } from "./image"

export interface SpriteEntity extends Entity {
  sprite: SpriteState & {
    image: ImageParams & { tileSize: readonly [width: number, height: number] }
    /** The frame shown, an index into the state's frames. */
    value: number
    state: string
    scale?: number
  }
}

/** Draws the sprite's current frame. */
export function renderSprite(
  entity: SpriteEntity,
  ctx: CanvasRenderingContext2D,
  api: GameApi,
): void

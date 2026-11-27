import type { GameApi } from "@inglorious/engine"

import type { RectangleEntity } from "./shapes/rectangle"

/** Draws the camera's frame in the game's `devMode`. */
export function renderCamera(
  entity: RectangleEntity,
  ctx: CanvasRenderingContext2D,
  api: GameApi,
): void

import type { GameApi } from "@inglorious/engine"
import type { ToGamePosition } from "@inglorious/engine/behaviors/input/mouse.js"

/** Turns a point on the page into a position in the game on `canvas`. */
export function createCoordinateConverter(
  canvas: HTMLCanvasElement,
  api: GameApi,
): ToGamePosition

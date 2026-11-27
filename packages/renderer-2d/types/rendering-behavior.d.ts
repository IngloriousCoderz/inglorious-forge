import type { Entity, Handler } from "@inglorious/engine"

/** Scales the canvas to the game's size and sends it the mouse and touch events. */
export function rendering(canvas: HTMLCanvasElement): {
  init: Handler<Entity, unknown>
  quit: Handler<Entity, unknown>
  destroy: () => void
}

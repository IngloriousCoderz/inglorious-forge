import type { GameSystem } from "@inglorious/engine"

/** Draws every entity with a position and a `render`, by layer, through the active camera. */
export function renderingSystem(canvas: HTMLCanvasElement): GameSystem

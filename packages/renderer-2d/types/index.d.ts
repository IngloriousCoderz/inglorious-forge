import type { GameConfig } from "@inglorious/engine"

/** A renderer for the engine: hand it to `new Engine(renderer, game)` before the game. */
export function createRenderer(canvas: HTMLCanvasElement): GameConfig

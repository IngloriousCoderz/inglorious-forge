import type { GameSystem } from "../index"

/**
 * Notifies `event` with the elapsed seconds `fps` times a second, for a world
 * that turns at its own rate. Stops on `pause`, starts again on `resume`.
 */
export function ticks(options?: {
  /** Defaults to `Infinity`, every frame. */
  fps?: number
  /** Defaults to `"tick"`. */
  event?: string
}): GameSystem

import type { EntitiesState } from "@inglorious/store"

import type { GameConfig } from "../index"

/** Runs a game: merges its configurations, drives its loop and updates its store. */
export class Engine {
  /**
   * Later configurations extend earlier ones, after the engine's own `Game`,
   * `Audio` and `Images` types and entities: a type that is a list of behaviors
   * gets the new ones appended.
   */
  constructor(...gameConfigs: GameConfig[])

  /** Runs each entity's `init`, such as loading sounds and images. */
  init(): Promise<unknown[]>

  /** Notifies `start` and starts the loop. */
  start(): void

  /** Notifies `stop` and stops the loop. A game stops itself by notifying `quit`. */
  stop(): void

  /** The entities as they are now. */
  getState(): EntitiesState

  /** Runs a frame, `dt` seconds after the last one. */
  update(dt: number): void
}

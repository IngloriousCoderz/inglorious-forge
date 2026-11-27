import type { BaseEntity, EntitiesState, Stored } from "@inglorious/store"

import type { Entity, EntityConfig, GameConfig } from "./index"

/** A game driven frame by frame, for tests. */
export interface TestGame {
  /** The names of the sounds played so far. */
  playedSounds: string[]
  /** Asserts `condition`, failing with `description`. */
  check(condition: boolean, description: string): void
  /** One entity, by id, typed as `TEntity`. */
  entity<TEntity extends BaseEntity = Entity>(id: string): Stored<TEntity>
  state(): EntitiesState
  /** The pooled entities in play, of one type or all. */
  pooled<TEntity extends BaseEntity = Entity>(
    typeName?: string,
  ): Stored<TEntity>[]
  notify(event: string, payload?: unknown): this
  /** Runs frames. Defaults to one. */
  step(frames?: number): this
  /** Runs the game for `seconds`. */
  advance(seconds: number): this
  /** Taps a key, by `code`, and lets a couple of frames run. */
  press(code: string): this
  /** Holds a key down for `frames` frames, 30 by default, then lets it up. */
  hold(code: string, frames?: number): this
}

/**
 * Makes a game to drive in a test, with its sounds watched. `extendWith` adds
 * the game's own moves, which can call the rest with `this`.
 */
export function createGame<
  TExtra extends Record<string, unknown> = Record<never, never>,
>(
  gameConfig: GameConfig & { entities: { game: BaseEntity | EntityConfig } },
  extendWith?: TExtra & ThisType<TestGame & TExtra>,
): TestGame & TExtra

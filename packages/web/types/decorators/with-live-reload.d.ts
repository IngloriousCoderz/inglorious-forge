import type { BaseEntity, Stored } from "@inglorious/store"

import type { Api } from "../mount"

/** Delivers a backend's changes, one table at a time. */
export interface LiveSource {
  /** Calls `onChange` on every change to `table`; returns the unsubscribe. */
  subscribe(table: string, onChange: () => void): () => void
}

/**
 * `TApi` is the app's own api, such as `AppApi`, so `payload` and `isLive`
 * can read its entities with their types.
 */
export interface LiveReloadConfig<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> {
  source: LiveSource
  /** The tables the entity reads. */
  tables: string[]
  /** The event that reloads the entity. Defaults to `"load"`. */
  event?: string
  /** What the event carries, such as the id of the record the entity shows. */
  payload?: (entity: Stored<TEntity>, api: TApi) => unknown
  /** Whether the entity is on screen. Defaults to always. */
  isLive?: (entity: Stored<TEntity>, api: TApi) => boolean
  /** Gathers a burst of changes into one reload. Defaults to 300 ms. */
  delay?: number
}

/** Subscribes on `create` and unsubscribes on `destroy`, around the type's own. */
export type LiveReloadBehavior<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> = {
  create: (entity: Stored<TEntity>, payload: unknown, api: TApi) => void
  destroy: (entity: Stored<TEntity>, payload: unknown, api: TApi) => void
}

export declare function withLiveReload<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
>(
  config: LiveReloadConfig<TEntity, TApi>,
): <TType extends object>(type: TType) => LiveReloadBehavior<TEntity, TApi>

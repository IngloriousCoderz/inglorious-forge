import { Api } from "../mount"

/** Delivers a backend's changes, one table at a time. */
export interface LiveSource {
  /** Calls `onChange` on every change to `table`; returns the unsubscribe. */
  subscribe(table: string, onChange: () => void): () => void
}

/**
 * `TApi` is the app's own api, such as `AppApi`, so `payload` and `isLive`
 * can read its entities with their types.
 */
export interface LiveReloadConfig<TEntity = any, TApi extends Api = Api> {
  source: LiveSource
  /** The tables the entity reads. */
  tables: string[]
  /** The event that reloads the entity. Defaults to `"load"`. */
  event?: string
  /** What the event carries, such as the id of the record the entity shows. */
  payload?: (entity: TEntity, api: TApi) => unknown
  /** Whether the entity is on screen. Defaults to always. */
  isLive?: (entity: TEntity, api: TApi) => boolean
  /** Gathers a burst of changes into one reload. Defaults to 300 ms. */
  delay?: number
}

export type LiveReloadBehavior = {
  create: (entity: any, payload?: any, api?: Api) => void
  destroy: (entity: any, payload?: any, api?: Api) => void
}

export declare function withLiveReload<TEntity = any, TApi extends Api = Api>(
  config: LiveReloadConfig<TEntity, TApi>,
): <T extends Record<string, any>>(type: T) => LiveReloadBehavior

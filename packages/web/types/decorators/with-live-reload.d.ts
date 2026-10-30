import { Api } from "../mount"

/** Delivers a backend's changes, one table at a time. */
export interface LiveSource {
  /** Calls `onChange` on every change to `table`; returns the unsubscribe. */
  subscribe(table: string, onChange: () => void): () => void
}

export interface LiveReloadConfig<TEntity = any> {
  source: LiveSource
  /** The tables the entity reads. */
  tables: string[]
  /** The event that reloads the entity. Defaults to `"load"`. */
  event?: string
  /** What the event carries, such as the id of the record the entity shows. */
  payload?: (entity: TEntity, api: Api) => unknown
  /** Whether the entity is on screen. Defaults to always. */
  isLive?: (entity: TEntity, api: Api) => boolean
  /** Gathers a burst of changes into one reload. Defaults to 300 ms. */
  delay?: number
}

export interface LiveReloadBehavior {
  create: (entity: any, payload?: any, api?: Api) => void
  destroy: (entity: any, payload?: any, api?: Api) => void
}

export declare function withLiveReload<TEntity = any>(
  config: LiveReloadConfig<TEntity>,
): <T extends Record<string, any>>(type: T) => LiveReloadBehavior

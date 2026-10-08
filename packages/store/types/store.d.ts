import type { Api } from "./api"

/**
 * Base entity structure
 */
export interface BaseEntity {
  type: string
  [key: string]: any
}

/**
 * Event structure
 */
export interface Event<T = any> {
  type: string
  payload?: T
}

/**
 * Entity type definition with event handlers.
 *
 * `updatesWhilePaused` opts the type out of a pause: the store stops handing out
 * `update` events while the world is halted, and a type that says this keeps
 * receiving them. It is for overlays and menus; anything that moves should leave it
 * off so that it stops.
 */
export type EntityType<TEntity extends BaseEntity = BaseEntity> = {
  [K: string]: (entity: TEntity, payload: any, api: Api) => void
}

/**
 * System definition with event handlers
 */
export type System<TState extends EntitiesState = EntitiesState> = {
  [K: string]: (state: TState, payload: any, api: Api) => void
}

/**
 * State structure (entities indexed by ID)
 */
export type EntitiesState<TEntity extends BaseEntity = BaseEntity> = {
  [id: string]: TEntity
}

/**
 * Types configuration
 */
export type TypesConfig<TEntity extends BaseEntity = BaseEntity> = {
  [typeName: string]: EntityType<TEntity>
}
/**
 * Whether each event triggers an update, or updates are batched until `update()` is called.
 */
export type UpdateMode = "auto" | "manual"

/**
 * How the state is copied before queued events are applied.
 *
 * - `"structural-sharing"` (default) applies events to a draft proxy, so only the entities that
 *   actually changed are copied. Unchanged entities keep their previous reference, which keeps
 *   reference-equality change detection cheap. Best for UI stores.
 * - `"full-clone"` deep-clones the whole state with `structuredClone` and applies events to the
 *   copy without a proxy. Cost is proportional to the total state size per update, but there is
 *   no per-entity proxy overhead, so it scales better when thousands of entities change every
 *   frame, as in a game simulation.
 *
 * Under both strategies the current state is left intact while the queued events are applied to
 * a separate draft, and the two are swapped only once every event has been processed. This means
 * that during an update `api.getEntity()` and `api.getEntities()` read the previous state rather
 * than the in-flight changes.
 */
export type UpdateStrategy = "structural-sharing" | "full-clone"

/**
 * Store configuration
 */
export interface StoreConfig<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> {
  types?: TypesConfig<TEntity>
  entities?: TState
  systems?: System<TState>[]
  middlewares?: Middleware<TEntity, TState>[]
  autoCreateEntities?: boolean
  updateMode?: UpdateMode
  updateStrategy?: UpdateStrategy
}

/**
 * Listener function for state updates
 */
export type Listener = () => void

/**
 * Unsubscribe function
 */
export type Unsubscribe = () => void

/**
 * Base store interface
 */
export interface Store<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> {
  subscribe: (listener: Listener) => Unsubscribe
  update: () => Event[]
  notify: (type: string, payload?: any) => void
  dispatch: (event: Event) => void
  getTypes: () => TypesConfig<TEntity>
  getType: (typeName: string) => EntityType<TEntity>
  setType: (typeName: string, type: EntityType<TEntity>) => void
  getState: () => TState
  getEntity: (id: string) => TState[string] | undefined
  setState: (nextState: TState) => void
  reset: () => void
  _api?: Api<TEntity, TState>
  extras?: Record<string, any>
}

/**
 * Middleware function type
 */
export type Middleware<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> = (store: Store<TEntity, TState>) => Store<TEntity, TState>

/**
 * Built-in event payloads
 */
export interface MorphEventPayload {
  id: string
  type: string
}

export type AddEventPayload<TEntity extends BaseEntity = BaseEntity> =
  TEntity & {
    id: string
  }

export type RemoveEventPayload = string

/**
 * Creates a store to manage state and events
 */
export function createStore<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
>(config: StoreConfig<TEntity, TState>): Store<TEntity, TState>

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
 * Entity type definition with event handlers
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
  mode?: "eager" | "batched"
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
 * API object exposed to handlers
 */
export interface Api<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> {
  getTypes: () => TypesConfig<TEntity>
  getType: (typeName: string) => EntityType<TEntity>
  setType: (typeName: string, type: EntityType<TEntity>) => void
  getEntities: () => TState
  getEntity: (id: string) => TEntity | undefined
  dispatch: (event: Event) => void
  notify: (type: string, payload?: any) => void
  [key: string]: any // For middleware extras
}

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

/**
 * Creates an API object
 */
export function createApi<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
>(
  store: Store<TEntity, TState>,
  extras?: Record<string, any>,
): Api<TEntity, TState>

/**
 * Helper to create a set of handlers for an async operation
 */
export function handleAsync<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
>(
  type: string,
  handlers: AsyncHandlers<TEntity, TPayload, TResult>,
): EntityType<TEntity>

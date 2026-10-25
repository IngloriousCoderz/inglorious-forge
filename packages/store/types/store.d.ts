import type { Api } from "./api"

/**
 * What every entity has. Declare an entity's other fields on its own interface:
 *
 * ```ts
 * interface CounterEntity extends BaseEntity {
 *   type: "Counter"
 *   value: number
 * }
 * ```
 *
 * The store gives each entity its key in the state as `id`, so it can be left
 * out of the initial entities; handlers always receive it (see `Stored`).
 */
export interface BaseEntity {
  type: string
  id?: string
  /**
   * Opts the entity out of a pause: the store stops handing out `update`
   * events while the world is halted, and an entity that says this keeps
   * receiving them. It is for overlays and menus; anything that moves should
   * leave it off so that it stops.
   */
  updatesWhilePaused?: boolean
}

/** An entity as the store holds it, and as handlers receive it: with its id. */
export type Stored<TEntity extends BaseEntity> = TEntity & { id: string }

/**
 * Event structure
 */
export interface Event<T = any> {
  type: string
  payload?: T
}

/**
 * An event handler: it receives the entity, the event's payload and the api.
 */
export type EventHandler<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> = (entity: Stored<TEntity>, payload: any, api: TApi) => unknown

/**
 * Any type for one kind of entity: its event handlers, by event name, and its
 * `render`. The store checks `types` against it.
 *
 * For rigour, declare a type's events and payloads with a `type` alias (an
 * interface does not fit `types`) and write the type against it:
 *
 * ```ts
 * type CounterType = {
 *   add: (entity: CounterEntity, amount: number) => void
 * }
 * const Counter: CounterType = {
 *   add(entity, amount) {
 *     entity.value += amount
 *   },
 * }
 * ```
 *
 * As a shorthand, `satisfies` infers the entity and the api without the
 * declaration, but neither lists the events nor types unannotated payloads:
 *
 * ```ts
 * const Counter = {
 *   add(entity, amount: number) {
 *     entity.value += amount
 *   },
 * } satisfies EntityType<CounterEntity, AppApi>
 * ```
 */
export type EntityType<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> = {
  /** Draws the entity. Unlike an event handler, it receives the api second. */
  render?: Renderer<TEntity, TApi>
  [member: string]: EventHandler<TEntity, TApi> | undefined
}

/** A type's `render`: it receives the entity and the api. */
export type Renderer<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> = (entity: Stored<TEntity>, api: TApi) => unknown

/**
 * A behavior: a type, or a function that extends the type it is given. A type
 * can also be an array of behaviors, applied in order: `[Chart, withRealtime]`.
 */
export type Behavior<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> =
  | EntityType<TEntity, TApi>
  | ((type: EntityType<TEntity, TApi>) => EntityType<TEntity, TApi>)

/** What the store's `types` holds for one type name: a behavior, or several. */
export type TypeDefinition<
  TEntity extends BaseEntity = BaseEntity,
  TApi extends Api = Api,
> = Behavior<TEntity, TApi> | Behavior<TEntity, TApi>[]

/**
 * A type definition for any entity. A handler that accepts some entity also
 * accepts `never`, so every type fits here, whatever entity it is for.
 */
export type AnyTypeDefinition = TypeDefinition<never, never>

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
 * The store's `types`. In a typed store, each entity's type name takes a type
 * for that entity, so `types: { Counter }` checks `Counter` against
 * `CounterEntity`. Names no entity has, such as a page rendered by name, take
 * any type.
 */
export type TypesConfig<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> = string extends TEntity["type"]
  ? { [typeName: string]: AnyTypeDefinition }
  : {
      [TName in TEntity["type"]]?: TypeDefinition<
        Extract<TEntity, { type: TName }>,
        Api<TEntity, TState>
      >
    } & { [typeName: string]: unknown }

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
 * - `"copy-on-dispatch"` deep-copies each entity the first time it is handed to a handler or read by a
 *   system, and applies events to the copy without a proxy. Entities nothing touches are not
 *   copied, and there is no per-entity proxy overhead, so it scales better when thousands of
 *   entities change every frame, as in a game simulation.
 *
 * Under both strategies the current state is left intact while the queued events are applied to
 * a separate draft, and the two are swapped only once every event has been processed. This means
 * that during an update `api.getEntity()` and `api.getEntities()` read the previous state rather
 * than the in-flight changes.
 */
export type UpdateStrategy = "structural-sharing" | "copy-on-dispatch"

/**
 * Store configuration
 */
export interface StoreConfig<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> {
  // The entity type comes from the type arguments, `entities` or
  // `middlewares`, never from `types`, which are checked against it.
  types?: NoInfer<TypesConfig<TEntity, TState>>
  /** The initial entities. With `autoCreateEntities`, those the store creates itself can be left out. */
  entities?: Partial<TState>
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
  getTypes: () => Record<string, EntityType>
  getType: (typeName: string) => EntityType
  setType: (typeName: string, type: AnyTypeDefinition) => void
  getState: () => TState
  getEntity: {
    <TId extends keyof TState & string>(
      id: TId,
    ): Stored<TState[TId]> | undefined
    (id: string): Stored<TEntity> | undefined
  }
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

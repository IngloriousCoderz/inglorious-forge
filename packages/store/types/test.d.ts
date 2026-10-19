import type { BaseEntity, EntitiesState, Event, Stored } from "./store"

/**
 * Mock API for testing (subset of full API)
 */
export interface MockApi<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> {
  getEntities: {
    (): TState
    (typeName: string): Stored<TEntity>[]
  }
  /** A known id gives that entity's own type; any other id, the union. */
  getEntity: {
    <TId extends keyof TState & string>(
      id: TId,
    ): Stored<TState[TId]> | undefined
    (id: string): Stored<TEntity> | undefined
  }
  select: <TResult>(selector: (state: TState) => TResult) => TResult
  dispatch: (event: Event) => void
  notify: (type: string, payload?: any) => void
  /** The events dispatched so far. */
  getEvents: () => Event[]
}

/**
 * Result of trigger function: the entity after the handler ran, and the
 * events it dispatched.
 */
export interface TriggerResult<TEntity extends BaseEntity = BaseEntity> {
  entity: TEntity
  events: Event[]
}

/**
 * Creates a mock API for testing event handlers, over the given entities.
 */
export function createMockApi<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
>(entities: TState): MockApi<TEntity, TState>

/**
 * Runs an event handler on a copy of an entity, as the store would, and
 * returns the updated copy with the events it dispatched. Without an api, the
 * handler gets a mock one holding just this entity.
 *
 * Any type's handler fits, whatever api it is typed with: it receives a
 * `MockApi`, which covers reading entities and dispatching events.
 *
 * ```ts
 * const { entity, events } = trigger(counter, Counter.increment, 5)
 * ```
 */
export function trigger<TEntity extends BaseEntity, TPayload = any>(
  entity: TEntity,
  eventHandler: (
    entity: Stored<TEntity>,
    payload: TPayload,
    api: never,
  ) => unknown,
  eventPayload?: TPayload,
  api?: MockApi,
): TriggerResult<TEntity>

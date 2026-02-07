import type { BaseEntity, EntitiesState } from "./store"

/**
 * Mock API for testing (subset of full API)
 */
export interface MockApi<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
> {
  getEntities: () => TState
  getEntity: (id: string) => TEntity | undefined
  select: <TResult>(selector: (state: TState) => TResult) => TResult
  dispatch: (event: Event) => void
  notify: (type: string, payload?: any) => void
  getEvents: () => Event[]
}

/**
 * Result of trigger function
 */
export interface TriggerResult<TState extends EntitiesState = EntitiesState> {
  entities: TState
  events: Event[]
}

/**
 * Creates a mock API for testing event handlers
 */
export function createMockApi<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
>(entities: TState): MockApi<TEntity, TState>

/**
 * Triggers an event handler in isolation for testing
 */
export function trigger<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
  TPayload = any,
>(
  entities: TState,
  eventHandler: (
    state: TState,
    payload: TPayload,
    api: MockApi<TEntity, TState>,
  ) => void,
  eventPayload: TPayload,
  api?: MockApi<TEntity, TState>,
): TriggerResult<TState>

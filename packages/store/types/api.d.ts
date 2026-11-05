import type {
  AnyTypeDefinition,
  BaseEntity,
  EntitiesState,
  EntityType,
  Event,
  Store,
  Stored,
} from "./store"
import type { AnyEvents, Notify } from "./events"

/**
 * API object exposed to handlers.
 *
 * An app's own `Api<AppEntity, AppState>` is an `Api`: a component typed with
 * the plain `Api` accepts it. So the members that read types give the plain
 * `EntityType`, rather than one typed for the app's entities.
 *
 * Told the app's events, `Api<AppEntity, AppState, AppEvents>` checks what
 * `notify` sends (see `EventsOf`), and is still an `Api`.
 */
export interface Api<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
  TEvents = AnyEvents,
> {
  getTypes: () => Record<string, EntityType>
  getType: (typeName: string) => EntityType
  setType: (typeName: string, type: AnyTypeDefinition) => void
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
  notify: Notify<TEvents, TEntity>
  [key: string]: any
}

/**
 * Creates an API object
 */
export function createApi<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
  TEvents = AnyEvents,
>(
  store: Store<TEntity, TState, TEvents>,
  extras?: Record<string, any>,
): Api<TEntity, TState, TEvents>

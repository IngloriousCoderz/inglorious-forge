import type {
  AnyTypeDefinition,
  BaseEntity,
  EntitiesState,
  EntityType,
  Event,
  Store,
  Stored,
} from "./store"

/**
 * API object exposed to handlers.
 *
 * An app's own `Api<AppEntity, AppState>` is an `Api`: a component typed with
 * the plain `Api` accepts it. So the members that read types give the plain
 * `EntityType`, rather than one typed for the app's entities.
 */
export interface Api<
  TEntity extends BaseEntity = BaseEntity,
  TState extends EntitiesState<TEntity> = EntitiesState<TEntity>,
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
  notify: (type: string, payload?: any) => void
  [key: string]: any
}

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

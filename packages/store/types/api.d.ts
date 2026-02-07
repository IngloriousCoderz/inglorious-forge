import type {
  BaseEntity,
  EntitiesState,
  EntityType,
  Event,
  Store,
  TypesConfig,
} from "./store"

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
  select: <TResult>(selector: (state: TState) => TResult) => TResult
  dispatch: (event: Event) => void
  notify: (type: string, payload?: any) => void
  [key: string]: any // For middleware extras
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

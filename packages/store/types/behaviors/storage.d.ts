import { Api } from "../api"
import { BaseEntity, EntityType } from "../store"

export interface StorageOptions {
  /** Where the fields are kept. Defaults to the entity's id. */
  key?: string | ((entity: BaseEntity & { id: string }) => string)
  /** A Web Storage, such as `() => sessionStorage`. Defaults to `localStorage`. */
  storage?: () => Storage | undefined
}

/**
 * Keeps some of an entity's fields in storage, as a byproduct of the entity,
 * which stays the one source of truth: they come back when it is created,
 * before the type's own `create`, and are written back after any handler that
 * changes them. Put it last in the type's array.
 */
export declare function withStorage(
  fields: string[],
  options?: StorageOptions,
): <TEntity extends BaseEntity, TApi extends Api>(
  type: EntityType<TEntity, TApi>,
) => EntityType<TEntity, TApi>

import { Api } from "./api"
import { AsyncEventHandlers } from "./async"
import { BaseEntity } from "./store"

/**
 * Decorates an async behavior with optimistic update boilerplate.
 *
 * Pass either a static shallow patch object or a factory that returns one.
 * The wrapper snapshots the current values for those keys, applies the patch
 * on start, and restores the previous values automatically if the operation fails.
 */
export function optimistic<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
>(
  behavior: AsyncEventHandlers<TEntity, TPayload, TResult>,
  optimistic:
    | Record<string, any>
    | ((
        entity: TEntity,
        payload: TPayload,
        api: Api,
      ) => Record<string, any> | null | undefined),
): AsyncEventHandlers<TEntity, TPayload, TResult>

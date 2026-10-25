import { Api } from "../api"
import { AsyncEvents } from "./async"
import { BaseEntity } from "../store"

/**
 * Decorates an async behavior with optimistic update boilerplate.
 *
 * Pass either a static shallow patch object or a factory that returns one.
 * The wrapper snapshots the current values for those keys, applies the patch
 * on start, and restores the previous values automatically if the operation fails.
 *
 * The behavior keeps the events `handleAsync` named and typed, and always has
 * a start event.
 */
export function optimistic<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
  TApi extends Api = Api,
  TType extends string = string,
>(
  behavior: AsyncEvents<TType, TEntity, TPayload, TResult, TApi>,
  optimistic:
    | Record<string, any>
    | ((
        entity: TEntity,
        payload: TPayload,
        api: TApi,
      ) => Record<string, any> | null | undefined),
): AsyncEvents<TType, TEntity, TPayload, TResult, TApi> & {
  [K in `${TType}Start`]: (
    entity: TEntity,
    payload: TPayload,
    api: TApi,
  ) => void
}

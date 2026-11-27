import type { BaseEntity, Stored } from "@inglorious/store"

import type { Api } from "../mount"

/**
 * What a limiter gives a type: each named handler limited, the original under
 * `<name><suffix>`, and a `destroy` that cancels the calls still waiting
 * before running the type's own.
 */
export type LimitedBehavior<
  TType,
  TName extends string,
  TSuffix extends string,
> = {
  [K in TName]: TType[K & keyof TType]
} & {
  [K in TName as `${K}${TSuffix}`]: TType[K & keyof TType]
} & {
  destroy: (entity: Stored<BaseEntity>, payload: unknown, api: Api) => void
}

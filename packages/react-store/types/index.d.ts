import type {
  BaseEntity,
  EntitiesState,
  Store,
  Stored,
} from "@inglorious/store"
import type { FC, ReactNode } from "react"

type Notify = (type: string, payload?: any) => void

export function createReactStore<
  T extends BaseEntity = BaseEntity,
  S extends EntitiesState<T> = EntitiesState<T>,
>(
  store: Store<T, S>,
): {
  Provider: FC<{ children: ReactNode }>
  /** Reads the state, re-rendering when what the selector returns changes. */
  useSelector: <TResult>(selector: (state: S) => TResult) => TResult
  /** A known id gives that entity's own type; any other id, the union. */
  useEntity: {
    <TId extends keyof S & string>(id: TId): Stored<S[TId]>
    (id: string): Stored<T> | undefined
  }
  useNotify: () => Notify
}

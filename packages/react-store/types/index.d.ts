import type {
  AnyEvents,
  BaseEntity,
  EntitiesState,
  Notify,
  Store,
  Stored,
} from "@inglorious/store"
import type { FC, ReactNode } from "react"

/**
 * Binds a store to React. A store created with the app's events
 * (`createStore<AppEntity, AppState, AppEvents>`) gives a `useNotify` that
 * checks them: each event's name and its payload.
 */
export function createReactStore<
  T extends BaseEntity = BaseEntity,
  S extends EntitiesState<T> = EntitiesState<T>,
  E = AnyEvents,
>(
  store: Store<T, S, E>,
): {
  Provider: FC<{ children: ReactNode }>
  /** Reads the state, re-rendering when what the selector returns changes. */
  useSelector: <TResult>(selector: (state: S) => TResult) => TResult
  /** A known id gives that entity's own type; any other id, the union. */
  useEntity: {
    <TId extends keyof S & string>(id: TId): Stored<S[TId]>
    (id: string): Stored<T> | undefined
  }
  /** Sends an event; with a typed store, it checks the event's name and payload. */
  useNotify: () => Notify<E, T>
}

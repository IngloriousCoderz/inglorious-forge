import type {
  BaseEntity,
  EntitiesState,
  Event,
  Middleware,
  Store,
  UpdateMode,
} from "../store"

export interface DevtoolsConfig {
  /** The instance's name in the extension. Defaults to the document title. */
  name?: string
  /** `"manual"` sends nothing per event, as in a game that sends a frame at a time. */
  updateMode?: UpdateMode
  /** Event types never shown. */
  blacklist?: string[]
  /** The only event types shown, when given. */
  whitelist?: string[]
  /** A last say on each event. */
  filter?: (event: Event) => boolean
}

export function createDevtools<
  T extends BaseEntity = BaseEntity,
  S extends EntitiesState<T> = EntitiesState<T>,
>(
  config?: DevtoolsConfig,
): {
  middleware: Middleware<T, S>
  connect: (store: Store<T, S>) => void
  disconnect: () => void
  send: (action: Event, state: S) => void
}

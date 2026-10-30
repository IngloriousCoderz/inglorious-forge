import { debounce } from "@inglorious/utils/functions"

const DEFAULT_DELAY = 300

// Every live entity's reload, across all the types that use the decorator, so
// one listener can reload them all when the page comes back into view.
const reloads = new Set()
let isWatchingVisibility = false

/**
 * Keeps an entity in step with a backend: whenever one of the `tables` it
 * reads changes, it reloads, by notifying its own `event` (default `"load"`).
 * There is no matching of which rows changed: a change to a table the entity
 * reads is enough. That costs a reload now and then, and spares every type
 * the rules that decide whether a change concerns it, which is where live
 * data goes wrong.
 *
 * - `source` delivers the changes: `subscribe(table, onChange)` returns an
 *   unsubscribe function. `@inglorious/supabase` has one for Supabase
 *   Realtime.
 * - `payload(entity, api)` is what the event carries, such as the id of the
 *   record the entity shows.
 * - `isLive(entity, api)` says whether the entity is on screen. A change
 *   while it is not is skipped: it loads when it opens anyway. Defaults to
 *   always.
 * - `delay` (default 300 ms) gathers a burst of changes into one reload.
 *
 * It also reloads every live entity when the page comes back into view: a
 * phone that put the app in the background may have dropped the connection,
 * and the changes with it.
 *
 * IMPORTANT: changes arrive long after the handler that subscribed has
 * returned, when its `entity` draft is revoked. So only the entity's `id` is
 * held, and the live entity is read from `api.getEntity(id)` when a change
 * comes.
 *
 * @param {Object} config
 * @param {{ subscribe(table: string, onChange: () => void): () => void }} config.source
 * @param {string[]} config.tables - The tables the entity reads.
 * @param {string} [config.event] - The event that reloads it.
 * @param {(entity: Object, api: Object) => unknown} [config.payload]
 * @param {(entity: Object, api: Object) => boolean} [config.isLive]
 * @param {number} [config.delay]
 *
 * @example
 * const types = {
 *   Inbox: [
 *     Inbox,
 *     withLiveReload({
 *       source: realtimeSource(supabase),
 *       tables: ["messages"],
 *       payload: (entity) => entity.folderId,
 *     }),
 *   ],
 * }
 */
export function withLiveReload({
  source,
  tables,
  event = "load",
  payload,
  isLive = () => true,
  delay = DEFAULT_DELAY,
}) {
  return (type) => {
    // entity id -> what to cancel when it goes
    const subscriptions = new Map()

    function stop(id) {
      const subscription = subscriptions.get(id)
      if (!subscription) return
      subscription.reload.cancel()
      subscription.unsubscribes.forEach((unsubscribe) => unsubscribe())
      reloads.delete(subscription.reload)
      subscriptions.delete(id)
    }

    return {
      create(entity, createPayload, api) {
        type.create?.(entity, createPayload, api)

        const id = entity.id // capture the primitive now, while the draft is live
        stop(id)
        const reload = debounce(() => {
          const live = api.getEntity(id) // fresh, live reference
          if (!live || !isLive(live, api)) return
          api.notify(`#${id}:${event}`, payload?.(live, api))
        }, delay)

        subscriptions.set(id, {
          reload,
          unsubscribes: tables.map((table) => source.subscribe(table, reload)),
        })
        reloads.add(reload)
        watchVisibility()
      },

      destroy(entity, destroyPayload, api) {
        stop(entity.id)
        type.destroy?.(entity, destroyPayload, api)
      },
    }
  }
}

function watchVisibility() {
  if (isWatchingVisibility || typeof document === "undefined") return
  isWatchingVisibility = true
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return
    reloads.forEach((reload) => reload())
  })
}

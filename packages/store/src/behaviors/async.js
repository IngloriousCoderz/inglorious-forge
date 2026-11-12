/**
 * The handlers of a request: a call whose progress the entity shows. The
 * entity's `status` is `"loading"` from the start, then `"success"` or
 * `"error"`, and its `error` holds what went wrong. Only the latest call
 * counts: the answer of a call that a newer one replaced is dropped, so a slow
 * search never overwrites a quicker, later one. Prefer it to `handleAsync`
 * whenever the entity shows that something is happening.
 *
 * @template {import('../store').BaseEntity} TEntity
 * @template TPayload
 * @template TResult
 *
 * @param {string} type The event that starts the request, which `withDebounce`
 *   can wrap. Its lifecycle events are those of `handleAsync`.
 * @param {Object} handlers As `handleAsync`'s. `error` receives the error as
 *   `toError` turns it, after `error` is set: it can change what the entity
 *   shows, such as moving to another step for an error it expects.
 * @param {Object} [options]
 * @param {string} [options.status="status"] The field for the status, when
 *   the entity has several requests, such as `"saveStatus"`.
 * @param {string} [options.error="error"] The field for the error.
 * @param {(error: unknown) => unknown} [options.toError] What to store as the
 *   error, such as a translation key. Defaults to the error's message.
 * @param {boolean} [options.isLatestOnly=true] Whether a call replaced by a
 *   newer one is ignored. Turn it off for calls that all count, such as saving
 *   several items at once.
 * @param {"entity" | "type" | "global"} [options.scope="entity"] Where the
 *   lifecycle events go, as in `handleAsync`.
 *
 * @example
 * const JobList = {
 *   ...handleRequest("search", {
 *     run: (query) => api.searchJobs(query),
 *     success(entity, jobs) {
 *       entity.jobs = jobs
 *     },
 *   }),
 * }
 *
 * const types = { JobList: [JobList, withDebounce(300, ["search"])] }
 */
export function handleRequest(type, handlers, options = {}) {
  const {
    status = "status",
    error: errorField = "error",
    toError = messageOf,
    isLatestOnly = true,
    scope = "entity",
  } = options

  const base = handleAsync(
    type,
    {
      start(entity, payload, api) {
        entity[status] = "loading"
        entity[errorField] = null
        handlers.start?.(entity, payload, api)
      },
      run: handlers.run,
      success(entity, result, api) {
        entity[status] = "success"
        handlers.success?.(entity, result, api)
      },
      error(entity, error, api) {
        const value = toError(error)
        entity[status] = "error"
        entity[errorField] = value
        handlers.error?.(entity, value, api)
      },
      finally: handlers.finally,
    },
    { scope },
  )
  if (!isLatestOnly) return base

  /** The latest call of each entity. */
  const latest = new Map()
  const startEvent = `${type}Start`
  const isCurrent = (entity, { callId }) => latest.get(entity.id) === callId
  const unlessStale = (event) => (entity, payload, api) => {
    if (isCurrent(entity, payload)) base[event](entity, payload, api)
  }
  const finallyEvent = `${type}Finally`

  const request = {
    ...base,

    [startEvent](entity, event, api) {
      latest.set(entity.id, event.callId)
      base[startEvent](entity, event, api)
    },

    [`${type}Success`]: unlessStale(`${type}Success`),
    [`${type}Error`]: unlessStale(`${type}Error`),

    [finallyEvent](entity, event, api) {
      if (!isCurrent(entity, event)) return
      latest.delete(entity.id)
      base[finallyEvent](entity, event, api)
    },
  }

  Object.defineProperty(request, ASYNC_META, {
    value: { type, scope },
    enumerable: false,
  })

  return request
}

/**
 * Creates a set of event handlers for managing an asynchronous operation lifecycle.
 *
 * This helper generates handlers for all stages of an async operation: start, run,
 * success, error, and finally. The lifecycle events are automatically scoped based
 * on the provided options. For a call whose progress the entity shows, use
 * `handleRequest`, which keeps the status and error and drops outdated answers;
 * `handleAsync` is for the rest, such as saving in the background or calls whose
 * failure only gets logged.
 *
 * @template {import('../store').BaseEntity} TEntity - The entity type
 * @template TPayload - The payload type passed to the operation
 * @template TResult - The result type returned by the async operation
 *
 * @param {string} type - The base event name (e.g., 'fetchTodos').
 *   Generated handlers will be named: `type`, `typeStart`, `typeRun`, `typeSuccess`, `typeError`, `typeFinally`
 *
 * @param {Object} handlers - The handler functions for each lifecycle stage.
 * @param {(entity: TEntity, payload: TPayload, api: import('../store').Api) => void} [handlers.start]
 *   Called synchronously before the async operation starts. Receives: (entity, payload, api)
 * @param {(payload: TPayload, api: import('../store').Api) => Promise<TResult> | TResult} handlers.run
 *   The async operation to perform. Must return a Promise or value.
 *   **Note:** Receives (payload, api) - NOT entity. Entity state should be modified in other handlers.
 * @param {(entity: TEntity, result: TResult, api: import('../store').Api) => void} [handlers.success]
 *   Called when the operation succeeds.
 *   Receives: (entity, result, api) where result is the resolved value from run()
 * @param {(entity: TEntity, error: any, api: import('../store').Api) => void} [handlers.error]
 *   Called when the operation fails.
 *   Receives: (entity, error, api) where error is the caught exception
 * @param {(entity: TEntity, api: import('../store').Api) => void} [handlers.finally]
 *   Called after the operation completes (success or failure). Receives: (entity, api)
 *
 * @param {Object} [options] - Configuration options.
 * @param {"entity" | "type" | "global"} [options.scope="entity"]
 *   Controls how lifecycle events are routed:
 *   - "entity": notify `#entityId:event` (default, safest - events only affect the triggering entity)
 *   - "type": notify `typeName:event` (broadcasts to all entities of this type)
 *   - "global": notify `event` (global broadcast to any listener, as games often want)
 *
 * Each call gets a `callId`, and every event of that call carries it: `Start`
 * and `Run` get `{ payload, callId }`, `Success` gets `{ result, callId }`,
 * `Error` gets `{ error, callId }` and `Finally` gets `{ callId }`. The
 * handlers above still receive the payload, result or error alone.
 *
 * @returns {Object} An object containing the generated event handlers that can be spread into a type:
 *   - `[type]`: Main trigger - dispatches Start (if defined) and Run events
 *   - `[typeStart]`: (if start handler provided) Executes the start handler
 *   - `[typeRun]`: Executes the async operation, then dispatches Success or Error, then Finally
 *   - `[typeSuccess]`: Executes the success handler
 *   - `[typeError]`: Executes the error handler
 *   - `[typeFinally]`: Executes the finally handler
 *
 * @example
 * // Saves in the background: a failure is only logged
 * const preferences = {
 *   ...handleAsync('localeSave', {
 *     run(locale) {
 *       return api.savePreferences({ locale })
 *     },
 *     error(_, error) {
 *       console.warn('Language not saved:', error)
 *     },
 *   }),
 * }
 *
 * // Trigger from UI
 * api.notify('#preferences:localeSave', 'it')
 *
 * @example
 * // With type scope - affects all entities of this type
 * const counter = {
 *   ...handleAsync('sync', {
 *     async run(payload, api) {
 *       const response = await fetch('/api/sync')
 *       return response.json()
 *     },
 *     success(entity, result) {
 *       entity.synced = true
 *       entity.lastSync = result.timestamp
 *     }
 *   }, { scope: 'type' })
 * }
 *
 * // Triggers sync for ALL counter entities
 * api.notify('counter:sync')
 */
export function handleAsync(type, handlers, options = {}) {
  const { scope = "entity" } = options

  function notify(api, entity, event, payload) {
    switch (scope) {
      case "entity":
        api.notify(`#${entity.id}:${event}`, payload)
        break
      case "type":
        api.notify(`${entity.type}:${event}`, payload)
        break
      case "global":
        api.notify(event, payload)
        break
    }
  }

  const asyncHandlers = {
    [type](entity, payload, api) {
      const callId = nextCallId()

      if (handlers.start) {
        notify(api, entity, `${type}Start`, { payload, callId })
      }

      notify(api, entity, `${type}Run`, { payload, callId })
    },

    ...(handlers.start && {
      [`${type}Start`](entity, { payload }, api) {
        handlers.start(entity, payload, api)
      },
    }),

    async [`${type}Run`](entity, { payload, callId }, api) {
      const scopedEntity = { id: entity.id, type: entity.type }

      try {
        const result = await handlers.run(payload, api)
        notify(api, scopedEntity, `${type}Success`, { result, callId })
      } catch (error) {
        notify(api, scopedEntity, `${type}Error`, { error, callId })
      } finally {
        notify(api, scopedEntity, `${type}Finally`, { callId })
      }
    },

    [`${type}Success`](entity, { result }, api) {
      handlers.success?.(entity, result, api)
    },

    [`${type}Error`](entity, { error }, api) {
      handlers.error?.(entity, error, api)
    },

    [`${type}Finally`](entity, _, api) {
      handlers.finally?.(entity, api)
    },
  }

  Object.defineProperty(asyncHandlers, ASYNC_META, {
    value: { type, scope },
    enumerable: false,
  })

  return asyncHandlers
}

const NEXT = 1

let lastCallId = 0

/**
 * A new id for one call of an async behavior, which its events carry.
 * @returns {number}
 */
export function nextCallId() {
  lastCallId += NEXT
  return lastCallId
}

export const ASYNC_META = Symbol.for("@inglorious/store/asyncMeta")

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

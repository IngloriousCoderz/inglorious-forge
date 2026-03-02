/**
 * Creates a set of event handlers for managing an asynchronous operation lifecycle.
 *
 * This helper generates handlers for all stages of an async operation: start, run,
 * success, error, and finally. The lifecycle events are automatically scoped based
 * on the provided options.
 *
 * @template {import('./store').BaseEntity} TEntity - The entity type
 * @template TPayload - The payload type passed to the operation
 * @template TResult - The result type returned by the async operation
 *
 * @param {string} type - The base event name (e.g., 'fetchTodos').
 *   Generated handlers will be named: `type`, `typeStart`, `typeRun`, `typeSuccess`, `typeError`, `typeFinally`
 *
 * @param {Object} handlers - The handler functions for each lifecycle stage.
 * @param {(entity: TEntity, payload: TPayload, api: import('./store').Api) => void} [handlers.start]
 *   Called synchronously before the async operation starts.
 *   Use for setting loading states. Receives: (entity, payload, api)
 * @param {(payload: TPayload, api: import('./store').Api) => Promise<TResult> | TResult} handlers.run
 *   The async operation to perform. Must return a Promise or value.
 *   **Note:** Receives (payload, api) - NOT entity. Entity state should be modified in other handlers.
 * @param {(entity: TEntity, result: TResult, api: import('./store').Api) => void} [handlers.success]
 *   Called when the operation succeeds.
 *   Receives: (entity, result, api) where result is the resolved value from run()
 * @param {(entity: TEntity, error: any, api: import('./store').Api) => void} [handlers.error]
 *   Called when the operation fails.
 *   Receives: (entity, error, api) where error is the caught exception
 * @param {(entity: TEntity, api: import('./store').Api) => void} [handlers.finally]
 *   Called after the operation completes (success or failure).
 *   Use for cleanup, resetting loading states. Receives: (entity, api)
 *
 * @param {Object} [options] - Configuration options.
 * @param {"entity" | "type" | "global"} [options.scope="entity"]
 *   Controls how lifecycle events are routed:
 *   - "entity": notify `#entityId:event` (default, safest - events only affect the triggering entity)
 *   - "type": notify `typeName:event` (broadcasts to all entities of this type)
 *   - "global": notify `event` (global broadcast to any listener)
 * @param {"parallel" | "latest"} [options.strategy="parallel"]
 *   Controls concurrency behavior for overlapping runs:
 *   - "parallel": all runs can resolve and emit lifecycle events (default)
 *   - "latest": only the most recently triggered run can emit success/error/finally
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
 * // Basic usage - fetch todos with loading state
 * const todoList = {
 *   init(entity) {
 *     entity.todos = []
 *     entity.status = 'idle'
 *   },
 *
 *   ...handleAsync('fetchTodos', {
 *     start(entity) {
 *       entity.status = 'loading'
 *     },
 *     async run(payload, api) {
 *       const response = await fetch('/api/todos')
 *       return response.json()
 *     },
 *     success(entity, todos) {
 *       entity.status = 'success'
 *       entity.todos = todos
 *     },
 *     error(entity, error) {
 *       entity.status = 'error'
 *       entity.error = error.message
 *     },
 *     finally(entity) {
 *       entity.lastFetched = Date.now()
 *     }
 *   })
 * }
 *
 * // Trigger from UI
 * api.notify('#todoList:fetchTodos')
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
 *
 * @example
 * // Minimal - just run and success
 * const user = {
 *   ...handleAsync('login', {
 *     async run({ username, password }, api) {
 *       const response = await fetch('/api/login', {
 *         method: 'POST',
 *         body: JSON.stringify({ username, password })
 *       })
 *       return response.json()
 *     },
 *     success(entity, user) {
 *       entity.currentUser = user
 *       entity.isAuthenticated = true
 *     }
 *   })
 * }
 *
 * @example
 * // Without start handler
 * const data = {
 *   ...handleAsync('fetch', {
 *     async run(payload, api) {
 *       return fetch(`/api/data/${payload.id}`).then(r => r.json())
 *     },
 *     success(entity, result) {
 *       entity.data = result
 *     },
 *     error(entity, error) {
 *       console.error('Fetch failed:', error)
 *     }
 *   })
 * }
 */
export function handleAsync(type, handlers, options = {}) {
  const { scope = "entity", strategy = "parallel" } = options
  const latest = strategy === "latest"
  const TOKEN_BASE = 0
  const TOKEN_INCREMENT = 1
  const runMetaSymbol = Symbol(`inglorious.async.runMeta.${type}`)
  const keyTokens = new Map()

  function getKey(identity) {
    switch (scope) {
      case "entity":
        return identity?.id ? `entity:${identity.id}` : null
      case "type":
        return identity?.type ? `type:${identity.type}` : null
      case "global":
        return "global"
      default:
        return null
    }
  }
  function nextToken(key) {
    const token = (keyTokens.get(key) || TOKEN_BASE) + TOKEN_INCREMENT
    keyTokens.set(key, token)
    return token
  }
  function getCurrentToken(key) {
    return keyTokens.get(key)
  }
  function clearTokenIfCurrent(key, token) {
    if (keyTokens.get(key) !== token) return
    keyTokens.delete(key)
  }
  function wrapRunPayload(payload, token) {
    return {
      [runMetaSymbol]: true,
      payload,
      token,
    }
  }
  function unwrapRunPayload(payload) {
    if (payload?.[runMetaSymbol]) {
      return {
        payload: payload.payload,
        token: payload.token,
      }
    }
    return { payload, token: null }
  }

  /**
   * Captures entity identity to avoid proxy revocation issues after await.
   */
  function getIdentity(entity) {
    return {
      id: entity?.id,
      type: entity?.type,
    }
  }
  function notify(api, identity, event, payload) {
    switch (scope) {
      case "entity":
        if (!identity?.id) return
        api.notify(`#${identity.id}:${event}`, payload)
        break
      case "type":
        if (!identity?.type) return
        api.notify(`${identity.type}:${event}`, payload)
        break
      case "global":
        api.notify(event, payload)
        break
    }
  }

  return {
    [type](entity, payload, api) {
      const identity = getIdentity(entity)
      const key = latest ? getKey(identity) : null
      const token = key ? nextToken(key) : null
      if (handlers.start) {
        notify(api, identity, `${type}Start`, payload)
      }

      notify(
        api,
        identity,
        `${type}Run`,
        latest && token != null ? wrapRunPayload(payload, token) : payload,
      )
    },

    ...(handlers.start && {
      [`${type}Start`](entity, payload, api) {
        handlers.start(entity, payload, api)
      },
    }),

    async [`${type}Run`](entity, payload, api) {
      const identity = getIdentity(entity)
      const key = latest ? getKey(identity) : null
      const { payload: runPayload, token: runToken } = unwrapRunPayload(payload)
      const isStale = () =>
        latest && key && runToken != null && getCurrentToken(key) !== runToken

      try {
        const result = await handlers.run(runPayload, api)
        if (isStale()) return
        notify(api, identity, `${type}Success`, result)
      } catch (error) {
        if (isStale()) return
        notify(api, identity, `${type}Error`, error)
      } finally {
        if (!isStale()) {
          notify(api, identity, `${type}Finally`)
          if (latest && key && runToken != null) {
            clearTokenIfCurrent(key, runToken)
          }
        }
      }
    },

    [`${type}Success`](entity, result, api) {
      handlers.success?.(entity, result, api)
    },

    [`${type}Error`](entity, error, api) {
      handlers.error?.(entity, error, api)
    },

    [`${type}Finally`](entity, _, api) {
      handlers.finally?.(entity, api)
    },
  }
}

import { ASYNC_META } from "./async.js"

const START = 0

/**
 * Decorates an async behavior with optimistic update boilerplate.
 *
 * Pass either a static shallow patch object or a factory that returns one.
 * The wrapper applies the patch during `Start` and rolls it back during `Error`.
 *
 * @template {import('./store').BaseEntity} TEntity
 * @template TPayload
 * @template TResult
 *
 * @param {import('./async').AsyncEventHandlers<TEntity, TPayload, TResult>} behavior
 * @param {Record<string, any> | ((entity: TEntity, payload: TPayload, api: import('./store').Api) => Record<string, any> | null | undefined)} optimistic
 *   Shallow patch applied optimistically on start, or a factory that returns it.
 *
 * @returns {import('./async').AsyncEventHandlers<TEntity, TPayload, TResult>}
 *
 * @example
 * const saveItem = optimistic(
 *   handleAsync("saveItem", {
 *     async run(payload) {
 *       return fetch("/api/items", {
 *         method: "POST",
 *         body: JSON.stringify(payload),
 *       }).then((res) => res.json())
 *     },
 *     success(entity, result) {
 *       entity.data = result
 *     },
 *   }),
 *   { status: "saving" },
 * )
 *
 * @example
 * const saveDraft = optimistic(
 *   handleAsync("saveDraft", {
 *     async run(payload) {
 *       return api.save(payload)
 *     },
 *   }),
 *   (entity, payload) => ({
 *     data: { ...entity.data, ...payload },
 *   }),
 * )
 */
export function optimistic(behavior, optimistic) {
  const { type, scope } = resolveAsyncMeta(behavior)

  const startEvent = `${type}Start`
  const runEvent = `${type}Run`
  const errorEvent = `${type}Error`
  const finallyEvent = `${type}Finally`

  const snapshots = new Map()

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

  const wrapped = {
    ...behavior,

    [type](entity, payload, api) {
      notify(api, entity, startEvent, payload)
      notify(api, entity, runEvent, payload)
    },

    [startEvent](entity, payload, api) {
      const patch = toPatch(optimistic, entity, payload, api)

      if (!patch) {
        behavior[startEvent]?.(entity, payload, api)
        return
      }

      if (typeof patch !== "object") {
        throw new TypeError(
          "optimistic expects the patch to be an object or a factory that returns an object",
        )
      }

      const key = getEntityKey(entity)
      const currentEntity = api.getEntity?.(key) ?? entity
      snapshots.set(key, snapshotPatch(currentEntity, patch))
      Object.assign(entity, patch)

      behavior[startEvent]?.(entity, payload, api)
    },

    [runEvent]: behavior[runEvent],

    [errorEvent](entity, error, api) {
      const key = getEntityKey(entity)
      restorePatch(entity, snapshots.get(key))
      behavior[errorEvent]?.(entity, error, api)
    },

    [finallyEvent](entity, api) {
      try {
        behavior[finallyEvent]?.(entity, api)
      } finally {
        snapshots.delete(getEntityKey(entity))
      }
    },
  }

  Object.defineProperty(wrapped, ASYNC_META, {
    value: { type, scope },
    enumerable: false,
  })

  return wrapped
}

function resolveAsyncMeta(behavior) {
  const meta = behavior?.[ASYNC_META]
  if (meta?.type) {
    return meta
  }

  const runHandlers = Object.keys(behavior ?? {}).filter(
    (key) => key.endsWith("Run") && typeof behavior[key] === "function",
  )

  const [runHandler, ...rest] = runHandlers

  if (!runHandler && rest.length) {
    throw new Error(
      "optimistic expects a single handleAsync result or one '*Run' handler",
    )
  }

  return {
    type: runHandler.slice(START, -"Run".length),
    scope: "entity",
  }
}

function getEntityKey(entity) {
  const id = entity?.id
  if (id == null) {
    throw new Error("optimistic requires entities to have a stable `id`")
  }

  return id
}

function toPatch(optimistic, entity, payload, api) {
  if (typeof optimistic === "function") {
    return optimistic(entity, payload, api)
  }

  return optimistic
}

function snapshotPatch(entity, patch) {
  const entries = []

  for (const key of Object.keys(patch)) {
    entries.push([
      key,
      Object.prototype.hasOwnProperty.call(entity, key),
      entity[key],
    ])
  }

  return entries
}

function restorePatch(entity, entries) {
  if (!entries) {
    return
  }

  for (const [key, existed, value] of entries) {
    if (existed) {
      entity[key] = value
    } else {
      delete entity[key]
    }
  }
}

import { ASYNC_META, nextCallId } from "./async.js"

const START = 0
const NOT_FOUND = -1
const ONE_CALL = 1

/**
 * Decorates an async behavior with optimistic update boilerplate.
 *
 * Pass either a static shallow patch object or a factory that returns one.
 * The wrapper applies the patch during `Start` and rolls it back during `Error`.
 *
 * Each call keeps its own snapshot, so calls on the same entity can overlap. A
 * failed call restores the keys it patched, except those a later pending call
 * patched too: that call's own rollback then restores them to what they were
 * before both.
 *
 * A patch built on the current value, such as a list with a temporary item
 * added, cannot be undone key by key when two calls change the same list. Give
 * `rollback` instead: it undoes the call's own change in place of restoring
 * the snapshot.
 *
 * @template {import('../store').BaseEntity} TEntity
 * @template TPayload
 * @template TResult
 * @template {string} TType
 *
 * @param {import('./async').AsyncEvents<TType, TEntity, TPayload, TResult>} behavior
 * @param {Record<string, any> | ((entity: TEntity, payload: TPayload, api: import('../store').Api) => Record<string, any> | null | undefined)} optimistic
 *   Shallow patch applied optimistically on start, or a factory that returns it.
 * @param {object} [options]
 * @param {(entity: TEntity, payload: TPayload, api: import('../store').Api) => void} [options.rollback]
 *   Undoes a failed call's change, in place of restoring the snapshot.
 *
 * @returns {import('./async').AsyncEvents<TType, TEntity, TPayload, TResult>}
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
 *
 * @example
 * const addTodo = optimistic(
 *   handleAsync("addTodo", {
 *     async run(todo) {
 *       return api.add(todo)
 *     },
 *   }),
 *   (entity, todo) => ({ todos: [...entity.todos, todo] }),
 *   {
 *     rollback(entity, todo) {
 *       entity.todos = entity.todos.filter(({ id }) => id !== todo.id)
 *     },
 *   },
 * )
 */
export function optimistic(behavior, optimistic, { rollback } = {}) {
  const { type, scope } = resolveAsyncMeta(behavior)

  const startEvent = `${type}Start`
  const runEvent = `${type}Run`
  const errorEvent = `${type}Error`
  const finallyEvent = `${type}Finally`

  /** The calls still pending, by entity id, in the order they started. */
  const pending = new Map()

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
      const callId = nextCallId()
      notify(api, entity, startEvent, { payload, callId })
      notify(api, entity, runEvent, { payload, callId })
    },

    [startEvent](entity, event, api) {
      const { payload, callId } = event
      const patch = toPatch(optimistic, entity, payload, api)

      if (patch && typeof patch !== "object") {
        throw new TypeError(
          "optimistic expects the patch to be an object or a factory that returns an object",
        )
      }

      const key = getEntityKey(entity)
      const currentEntity = api.getEntity?.(key) ?? entity
      const calls = pending.get(key) ?? []
      calls.push({
        callId,
        payload,
        snapshot: snapshotPatch(currentEntity, patch ?? {}),
      })
      pending.set(key, calls)
      if (patch) Object.assign(entity, patch)

      behavior[startEvent]?.(entity, event, api)
    },

    [runEvent]: behavior[runEvent],

    [errorEvent](entity, event, api) {
      const calls = pending.get(getEntityKey(entity)) ?? []
      const index = calls.findIndex(({ callId }) => callId === event.callId)

      if (index !== NOT_FOUND) {
        const [call] = calls.splice(index, ONE_CALL)
        if (rollback) {
          rollback(entity, call.payload, api)
        } else {
          restorePatch(entity, call.snapshot, calls.slice(index))
        }
      }

      behavior[errorEvent]?.(entity, event, api)
    },

    [finallyEvent](entity, event, api) {
      try {
        behavior[finallyEvent]?.(entity, event, api)
      } finally {
        const key = getEntityKey(entity)
        const calls = (pending.get(key) ?? []).filter(
          ({ callId }) => callId !== event?.callId,
        )
        if (calls.length) pending.set(key, calls)
        else pending.delete(key)
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
  return new Map(
    Object.keys(patch).map((key) => [
      key,
      { existed: Object.hasOwn(entity, key), value: entity[key] },
    ]),
  )
}

function restorePatch(entity, snapshot, laterCalls) {
  for (const [key, before] of snapshot) {
    const later = laterCalls.find((call) => call.snapshot.has(key))
    if (later) {
      later.snapshot.set(key, before)
    } else if (before.existed) {
      entity[key] = before.value
    } else {
      delete entity[key]
    }
  }
}

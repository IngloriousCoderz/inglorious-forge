import { pick } from "@inglorious/utils/data-structures/object.js"
import { isPromiseLike } from "@inglorious/utils/data-structures/promise.js"
import { parseJSON, readItem, writeItem } from "@inglorious/utils/storage.js"

const RENDER = /^render/

let decorators = 0

/**
 * Keeps some of an entity's fields in storage, as a byproduct of the entity:
 * the entity stays the one source of truth. When the entity is created, the
 * fields come back from storage, before the type's own `create`, whose
 * defaults (`entity.consent ??= null`) then keep them. After every handler,
 * the fields are written back if they changed.
 *
 * Put it last in the type's array: it saves after the handlers before it.
 * Storage that is missing, full or refusing, as in a private window, only
 * means nothing is kept.
 *
 * A storage whose `getItem` returns a promise, such as Capacitor Preferences,
 * restores the fields once it answers: the entity starts with the type's
 * defaults, and `storageRestore` then brings back the fields no handler has
 * changed in the meantime. Nothing is written until then. A type's own
 * `storageRestore(entity, restored, api)` runs after.
 *
 * @param {string[]} fields The entity's fields to keep.
 * @param {Object} [options]
 * @param {string | ((entity: Object) => string)} [options.key] Where the
 *   fields are kept. Defaults to the entity's id.
 * @param {() => Storage | undefined} [options.storage] A Web Storage, such as
 *   `() => sessionStorage` for the tab only, or anything with the same
 *   `getItem` and `setItem`, answering now or with a promise. Defaults to
 *   `localStorage`.
 *
 * @example
 * const types = {
 *   Analytics: [createAnalytics({ adapter }), withStorage(["consent"])],
 *   Settings: [Settings, withStorage(["theme", "volume"], { key: "my-app" })],
 * }
 */
export function withStorage(
  fields,
  { key, storage = () => globalThis.localStorage } = {},
) {
  const keyOf = (entity) =>
    typeof key === "function" ? key(entity) : (key ?? entity.id)

  return (type) => {
    // Tells this decorator's restores from those of others on the same type.
    const source = `withStorage:${++decorators}`
    /** What is kept for each entity, as written. */
    const kept = new Map()
    /** For entities still waiting on storage, their fields as created. */
    const pending = new Map()

    function save(entity) {
      if (!isEntity(entity) || pending.has(entity.id)) return
      const value = JSON.stringify(pick(entity, fields))
      if (kept.get(entity.id) === value) return
      kept.set(entity.id, value)
      writeItem(keyOf(entity), value, storage)
    }

    const behavior = {}

    for (const [name, handler] of Object.entries(type)) {
      if (typeof handler !== "function" || name === "create") continue
      if (RENDER.test(name)) continue
      behavior[name] = function (entity, payload, api) {
        const result = handler.call(this, entity, payload, api)
        save(entity)
        return result
      }
    }

    behavior.create = function (entity, payload, api) {
      const stored = readItem(keyOf(entity), storage)

      if (isPromiseLike(stored)) {
        const result = type.create?.call(this, entity, payload, api)
        pending.set(entity.id, snapshot(entity, fields))
        const { id } = entity
        const restore = (value) =>
          api.notify(`#${id}:storageRestore`, { source, value: value ?? null })
        stored.then(restore, () => restore(null))
        return result
      }

      kept.set(entity.id, stored)
      Object.assign(entity, pick(parseJSON(stored), fields))
      const result = type.create?.call(this, entity, payload, api)
      save(entity)
      return result
    }

    behavior.storageRestore = function (entity, payload, api) {
      const created = pending.get(entity.id)
      if (payload?.source !== source || !created) {
        type.storageRestore?.call(this, entity, payload, api)
        save(entity)
        return
      }
      pending.delete(entity.id)
      kept.set(entity.id, payload.value)

      const restored = pick(parseJSON(payload.value), fields)
      for (const [field, value] of Object.entries(restored)) {
        if (JSON.stringify(entity[field]) === created[field]) {
          entity[field] = value
        }
      }
      type.storageRestore?.call(this, entity, restored, api)
      save(entity)
    }

    return behavior
  }
}

function snapshot(entity, fields) {
  return Object.fromEntries(
    fields.map((field) => [field, JSON.stringify(entity[field])]),
  )
}

function isEntity(value) {
  return Boolean(value) && typeof value === "object" && "id" in value
}

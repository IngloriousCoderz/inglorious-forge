const RENDER = /^render/

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
 * @param {string[]} fields The entity's fields to keep.
 * @param {Object} [options]
 * @param {string | ((entity: Object) => string)} [options.key] Where the
 *   fields are kept. Defaults to the entity's id.
 * @param {() => Storage | undefined} [options.storage] A Web Storage, such as
 *   `() => sessionStorage` for the tab only. Defaults to `localStorage`.
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
    /** What is kept for each entity, as written. */
    const kept = new Map()

    function save(entity) {
      if (!isEntity(entity)) return
      const value = JSON.stringify(pick(entity, fields))
      if (kept.get(entity.id) === value) return
      kept.set(entity.id, value)
      write(storage, keyOf(entity), value)
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
      const stored = read(storage, keyOf(entity))
      kept.set(entity.id, stored)
      Object.assign(entity, pick(parse(stored), fields))
      const result = type.create?.call(this, entity, payload, api)
      save(entity)
      return result
    }

    return behavior
  }
}

function pick(source, fields) {
  const picked = {}
  for (const field of fields) {
    if (source && field in source) picked[field] = source[field]
  }
  return picked
}

function isEntity(value) {
  return Boolean(value) && typeof value === "object" && "id" in value
}

function parse(stored) {
  try {
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function read(storage, key) {
  try {
    return storage()?.getItem(key) ?? null
  } catch {
    return null
  }
}

function write(storage, key, value) {
  try {
    storage()?.setItem(key, value)
  } catch {
    // Nothing is kept: the entity still has the value.
  }
}

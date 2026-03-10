let runtimeIdCounter = 0
const RUNTIME_ID_INCREMENT = 1
const runtimeIdCache = new WeakMap()
const runtimeDataIdCache = new WeakMap()
const runtimeKeyIdCache = new WeakMap()

export function ensureChartRuntimeId(entity) {
  if (!entity || typeof entity !== "object") return "chart-runtime-unknown"

  if (entity.__runtimeId) return String(entity.__runtimeId)
  if (entity.runtimeId !== undefined && entity.runtimeId !== null) {
    return String(entity.runtimeId)
  }

  if (entity.id) return String(entity.id)

  if (runtimeIdCache.has(entity)) {
    return runtimeIdCache.get(entity)
  }

  if (entity.data && typeof entity.data === "object") {
    const cachedByData = runtimeDataIdCache.get(entity.data)
    if (cachedByData) {
      runtimeIdCache.set(entity, cachedByData)
      return cachedByData
    }
  }

  if (!entity.__runtimeId) {
    runtimeIdCounter += RUNTIME_ID_INCREMENT
    const nextId = `chart-runtime-${runtimeIdCounter}`
    Object.defineProperty(entity, "__runtimeId", {
      value: nextId,
      writable: true,
      configurable: true,
      enumerable: false,
    })
  }

  runtimeIdCache.set(entity, entity.__runtimeId)
  if (entity.data && typeof entity.data === "object") {
    runtimeDataIdCache.set(entity.data, entity.__runtimeId)
  }
  return entity.__runtimeId
}

export function ensureChartRuntimeIdWithKey(entity, key) {
  if (key && typeof key === "object") {
    const cached = runtimeKeyIdCache.get(key)
    if (cached) {
      if (entity && typeof entity === "object") {
        Object.defineProperty(entity, "__runtimeId", {
          value: cached,
          writable: true,
          configurable: true,
          enumerable: false,
        })
      }
      return cached
    }
  }

  const runtimeId = ensureChartRuntimeId(entity)

  if (key && typeof key === "object") {
    runtimeKeyIdCache.set(key, runtimeId)
  }

  return runtimeId
}

const DEFAULT_STORAGE = () => globalThis.localStorage

function store(storage) {
  return storage ?? DEFAULT_STORAGE()
}

/**
 * Reads a value back as JSON.
 *
 * Storage that is absent -- a server render, a private window, a test -- reads as the
 * fallback rather than throwing, so a caller does not have to know whether it is running
 * somewhere that has any. A value that cannot be parsed is treated the same way: what is
 * stored is not this function's to defend, and refusing to start over it would be worse
 * than starting again.
 *
 * @param {string} key - Where the value is kept.
 * @param {*} fallback - What to answer when there is nothing usable to read.
 * @param {Storage} [storage] - Where to read from. Defaults to the browser's own.
 * @returns {*} The stored value, or the fallback.
 */
export function readJSON(key, fallback, storage) {
  const raw = store(storage)?.getItem(key)

  if (raw === null || raw === undefined) return fallback

  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

/**
 * Writes a value down as JSON, and answers whether it took.
 *
 * Storage can be full, absent, or refusing writes for its own reasons, and none of those
 * is worth throwing over: a game that cannot remember a score can still be played. The
 * answer is returned so that a caller which does care -- a test, mostly -- can say so.
 *
 * @param {string} key - Where to keep the value.
 * @param {*} value - The value to keep.
 * @param {Storage} [storage] - Where to write to. Defaults to the browser's own.
 * @returns {boolean} `true` if the value was written.
 */
export function writeJSON(key, value, storage) {
  try {
    store(storage)?.setItem(key, JSON.stringify(value))

    return true
  } catch {
    return false
  }
}

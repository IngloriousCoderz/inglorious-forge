import { isPromiseLike } from "./data-structures/promise.js"

const DEFAULT_STORAGE = () => globalThis.localStorage

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
 * @param {Storage | (() => Storage | undefined)} [storage] - Where to read from. Defaults to the browser's own.
 * @returns {*} The stored value, or the fallback.
 */
export function readJSON(key, fallback, storage) {
  return parseJSON(readItem(key, storage), fallback)
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
 * @param {Storage | (() => Storage | undefined)} [storage] - Where to write to. Defaults to the browser's own.
 * @returns {boolean} `true` if the value was written.
 */
export function writeJSON(key, value, storage) {
  try {
    return writeItem(key, JSON.stringify(value), storage)
  } catch {
    return false
  }
}

/**
 * Parses what storage held, or answers the fallback when it held nothing or
 * nothing that parses.
 *
 * @param {string | null | undefined} raw - What was read.
 * @param {*} [fallback=null] - What to answer otherwise.
 * @returns {*} The parsed value, or the fallback.
 */
export function parseJSON(raw, fallback = null) {
  if (raw === null || raw === undefined) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

/**
 * Reads a string without throwing: absent or refusing storage reads as `null`.
 * A storage answering with promises, such as Capacitor Preferences, gives its
 * promise back.
 *
 * @param {string} key - Where the value is kept.
 * @param {Storage | (() => Storage | undefined)} [storage] - Where to read from, or a function giving it: one giving nothing means no storage. Defaults to the browser's own.
 * @returns {string | null | Promise<string | null>} The stored string.
 */
export function readItem(key, storage) {
  try {
    return resolve(storage)?.getItem(key) ?? null
  } catch {
    return null
  }
}

/**
 * Writes a string without throwing, and answers whether it was handed over. A
 * storage answering with promises has its failures swallowed too.
 *
 * @param {string} key - Where to keep the value.
 * @param {string} value - The value to keep.
 * @param {Storage | (() => Storage | undefined)} [storage] - Where to write to, or a function giving it. Defaults to the browser's own.
 * @returns {boolean} `true` if the storage took it.
 */
export function writeItem(key, value, storage) {
  try {
    const target = resolve(storage)
    if (!target) return false
    const written = target.setItem(key, value)
    if (isPromiseLike(written)) written.then(undefined, () => {})
    return true
  } catch {
    return false
  }
}

function resolve(storage) {
  if (typeof storage === "function") return storage()
  return storage ?? DEFAULT_STORAGE()
}

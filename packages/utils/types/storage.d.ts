/** A storage, or a function giving one: a function giving nothing means no storage. */
export type StorageSource =
  | Storage
  | KeyValueStorage
  | null
  | (() => Storage | KeyValueStorage | undefined)

/** Anything that keeps strings like a Web Storage, now or with promises. */
export interface KeyValueStorage {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
}

/**
 * Reads a value back as JSON. Absent storage, a missing key or a value that
 * cannot be parsed all read as the fallback, rather than throwing.
 *
 * @param key - Where the value is kept.
 * @param fallback - What to answer when there is nothing usable to read.
 * @param storage - Where to read from. Defaults to the browser's own.
 * @returns The stored value, or the fallback.
 */
export function readJSON<T>(
  key: string,
  fallback: T,
  storage?: StorageSource,
): T

/**
 * Writes a value down as JSON, and answers whether it took. Absent, full or
 * refusing storage answers `false` rather than throwing.
 *
 * @param key - Where to keep the value.
 * @param value - The value to keep.
 * @param storage - Where to write to. Defaults to the browser's own.
 * @returns `true` if the value was written.
 */
export function writeJSON(
  key: string,
  value: unknown,
  storage?: StorageSource,
): boolean

/** Parses what storage held, or answers the fallback (`null` by default). */
export function parseJSON<T = unknown>(
  raw: string | null | undefined,
  fallback?: T,
): T

/**
 * Reads a string without throwing: absent or refusing storage reads as `null`.
 * A storage answering with promises gives its promise back.
 */
export function readItem(
  key: string,
  storage?: StorageSource,
): string | null | Promise<string | null>

/** Writes a string without throwing, and answers whether the storage took it. */
export function writeItem(
  key: string,
  value: string,
  storage?: StorageSource,
): boolean

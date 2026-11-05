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
  storage?: Storage | null,
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
  storage?: Storage | null,
): boolean

const warned = new Set()

/**
 * Emits a warning only once per key.
 *
 * @param {string} key
 * @param {string} message
 */
export function warnOnce(key, message) {
  if (warned.has(key)) {
    return
  }

  warned.add(key)
  console.warn(`[inglorious-motion] ${message}`)
}

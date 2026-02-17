const emittedWarnings = new Set()

function isDevEnvironment() {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    typeof import.meta.env.DEV === "boolean"
  ) {
    return import.meta.env.DEV
  }

  return false
}

/**
 * Emits a warning once in development environments.
 * @param {string} key
 * @param {string} message
 */
export function warnOnce(key, message) {
  if (!isDevEnvironment()) return
  if (emittedWarnings.has(key)) return
  emittedWarnings.add(key)

  console.warn(`[inglorious/ag-grid] ${message}`)
}

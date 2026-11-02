const BASE = "http://same.invalid"

/**
 * A path taken from a URL, such as where to return after signing in, if it
 * stays on this site; `null` otherwise. Comparing origins catches the forms
 * browsers read as another site: `//evil.com`, `/\evil.com`, `https://evil.com`.
 * @param {unknown} value
 * @returns {string | null}
 */
export function safePath(value) {
  if (typeof value !== "string" || !value.startsWith("/")) return null
  try {
    const url = new URL(value, BASE)
    if (url.origin !== BASE) return null
    return url.pathname + url.search + url.hash
  } catch {
    return null
  }
}

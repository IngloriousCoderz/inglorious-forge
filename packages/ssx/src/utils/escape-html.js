/**
 * Escapes text for an HTML attribute value or element content.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

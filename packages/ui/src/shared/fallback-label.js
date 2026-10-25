import { nothing } from "@inglorious/web"

/**
 * A label beside its control is tied to it by id. Without an id there is nothing to
 * tie it with, so the control names itself after the label instead: clicking the label
 * no longer focuses the control, but a screen reader still announces what it is for.
 *
 * Only a plain-text label can be used this way; a template has no text to give.
 *
 * @param {string | undefined} controlId
 * @param {unknown} label
 * @returns {string | typeof nothing}
 */
export function fallbackLabel(controlId, label) {
  if (controlId || typeof label !== "string" || !label) return nothing

  return label
}

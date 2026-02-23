import { get } from "@inglorious/utils/data-structures/object.js"

/**
 * Retrieves the validation error for a specific form field.
 * @param {FormEntity} form - The form entity object.
 * @param {string} path - The dot-separated path to the field (e.g., 'user.name').
 * @returns {string|null|undefined} The error message for the field, or null/undefined if there is no error.
 */
export function getFieldError(form, path) {
  return get(form.errors, path)
}

/**
 * Retrieves the value of a specific form field.
 * @param {FormEntity} form - The form entity object.
 * @param {string} path - The dot-separated path to the field (e.g., 'user.name').
 * @param {*} [defaultValue] - An optional default value to return if the path does not exist.
 * @returns {*} The value of the field, or the default value if not found.
 */
export function getFieldValue(form, path, defaultValue) {
  return get(form.values, path, defaultValue)
}

/**
 * Checks if a specific form field has been touched (i.e., has received a blur event).
 * @param {FormEntity} form - The form entity object.
 * @param {string} path - The dot-separated path to the field (e.g., 'user.name').
 * @returns {boolean} `true` if the field has been touched, otherwise `false`.
 */
export function isFieldTouched(form, path) {
  return Boolean(get(form.touched, path))
}

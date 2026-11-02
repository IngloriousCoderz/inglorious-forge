export function format(value, type) {
  if (type === "number") return Number(value)
  if (type === "boolean")
    return value === "true" ? true : value === "false" ? false : null
  if (["date", "time", "datetime"].includes(type))
    return new Date(value).getTime()
  return value
}

const DATE_LENGTH = 10
const DATETIME_LENGTH = 16
const MINUTE_MS = 60_000

/**
 * A filter value as its field shows it. Date fields read their text as UTC,
 * datetime fields as local time, so each turns back the same way.
 * @param {any} value
 * @param {string} inputType
 * @returns {string|number}
 */
export function toField(value, inputType) {
  if (value == null || Number.isNaN(value)) return ""
  if (typeof value !== "number") return value
  if (inputType === "date") {
    return new Date(value).toISOString().slice(0, DATE_LENGTH)
  }
  if (inputType === "datetime-local") {
    const offset = new Date(value).getTimezoneOffset() * MINUTE_MS
    return new Date(value - offset).toISOString().slice(0, DATETIME_LENGTH)
  }
  return value
}

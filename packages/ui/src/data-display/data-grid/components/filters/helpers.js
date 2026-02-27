export function format(value, type) {
  if (type === "number") return Number(value)
  if (type === "boolean")
    return value === "true" ? true : value === "false" ? false : null
  if (["date", "time", "datetime"].includes(type))
    return new Date(value).getTime()
  return value
}

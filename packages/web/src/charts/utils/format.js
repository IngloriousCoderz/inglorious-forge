import { format } from "d3-format"
import { timeFormat } from "d3-time-format"

export function formatNumber(value, fmt = ",.2f") {
  return format(fmt)(value)
}

export function formatDate(date, fmt = "%Y-%m-%d") {
  return timeFormat(fmt)(new Date(date))
}

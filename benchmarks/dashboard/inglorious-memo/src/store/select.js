import { compute } from "@inglorious/web"

const SAME = 0
const DEFAULT_AVG = 0

export const rows = (entities) => entities.table.data
const filter = (entities) => entities.metrics.filter
const sortBy = (entities) => entities.metrics.sortBy

export const filteredRows = compute(
  (rows, filter, sortBy) =>
    rows
      .filter((row) => {
        return (
          row.name.toLowerCase().includes(filter.toLowerCase()) ||
          row.status.toLowerCase().includes(filter.toLowerCase())
        )
      })
      .sort((a, b) => {
        if (sortBy === "id") return a.id - b.id
        if (sortBy === "value") return b.value - a.value
        if (sortBy === "progress") return b.progress - a.progress
        return SAME
      }),
  [rows, filter, sortBy],
)

export const chartData = ({ rangeStart, rangeEnd }) =>
  compute(
    (rows) => {
      const values = rows.slice(rangeStart, rangeEnd).map((r) => r.value)
      const max = Math.max(...values)
      const avg = values.length
        ? Math.floor(values.reduce((a, b) => a + b) / values.length)
        : DEFAULT_AVG
      return { values, max, avg }
    },
    [filteredRows],
  )

const SAME = 0
const DEFAULT_AVG = 0

export const rows = (entities) => entities.table.data
const filter = (entities) => entities.metrics.filter
const sortBy = (entities) => entities.metrics.sortBy

export const filteredRows = (entities) => {
  const _rows = rows(entities)
  const _filter = filter(entities)
  const _sortBy = sortBy(entities)

  return _rows
    .filter((row) => {
      return (
        row.name.toLowerCase().includes(_filter.toLowerCase()) ||
        row.status.toLowerCase().includes(_filter.toLowerCase())
      )
    })
    .sort((a, b) => {
      if (_sortBy === "id") return a.id - b.id
      if (_sortBy === "value") return b.value - a.value
      if (_sortBy === "progress") return b.progress - a.progress
      return SAME
    })
}

export const chartData = (start, end) => (entities) => {
  const rows = filteredRows(entities)
  const values = rows.slice(start, end).map((r) => r.value)
  const max = Math.max(...values)
  const avg = values.length
    ? Math.floor(values.reduce((a, b) => a + b) / values.length)
    : DEFAULT_AVG
  return { values, max, avg }
}

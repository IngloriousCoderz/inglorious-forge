import { createSelector } from "@reduxjs/toolkit"

const SAME = 0
const DEFAULT_AVG = 0

export const selectRows = (state) => state.data.rows
export const selectFilter = (state) => state.data.filter
export const selectSortBy = (state) => state.data.sortBy
export const selectMetrics = (state) => state.metrics

export const selectFilteredRows = createSelector(
  [selectRows, selectFilter, selectSortBy],
  (rows, filter, sortBy) => {
    const filtered = rows.filter(
      (row) =>
        row.name.toLowerCase().includes(filter.toLowerCase()) ||
        row.status.toLowerCase().includes(filter.toLowerCase()),
    )

    return filtered.sort((a, b) => {
      if (sortBy === "id") return a.id - b.id
      if (sortBy === "value") return b.value - a.value
      if (sortBy === "progress") return b.progress - a.progress
      return SAME
    })
  },
)

export const selectChartData = (start, end) =>
  createSelector([selectFilteredRows], (rows) => {
    const values = rows.slice(start, end).map((r) => r.value)
    const max = Math.max(...values)
    const avg = values.length
      ? Math.floor(values.reduce((a, b) => a + b) / values.length)
      : DEFAULT_AVG
    return { values, max, avg }
  })

import { createSelector } from "@inglorious/store/select"

const SAME = 0
const DEFAULT_AVG = 0

export const selectRows = (state) => state.table.data
export const selectFilter = (state) => state.metrics.filter
export const selectSortBy = (state) => state.metrics.sortBy
export const selectMetrics = (state) => state.metrics

export const selectFilteredRows = createSelector(
  [selectRows, selectFilter, selectSortBy],
  (rows, filter, sortBy) => {
    const normalizedFilter = filter.toLowerCase()
    const filtered = rows.filter(
      (row) =>
        row.name.toLowerCase().includes(normalizedFilter) ||
        row.status.toLowerCase().includes(normalizedFilter),
    )

    return filtered.sort((a, b) => {
      if (sortBy === "id") return a.id - b.id
      if (sortBy === "value") return b.value - a.value
      if (sortBy === "progress") return b.progress - a.progress
      return SAME
    })
  },
)

export const selectChartData = (chartId) =>
  createSelector(
    [selectFilteredRows, (state) => state[chartId]],
    (rows, chart) => {
      const values = rows
        .slice(chart.rangeStart, chart.rangeEnd)
        .map((r) => r.value)
      const max = Math.max(...values)
      const avg = values.length
        ? Math.floor(values.reduce((a, b) => a + b) / values.length)
        : DEFAULT_AVG

      return {
        title: chart.title,
        values,
        max,
        avg,
      }
    },
  )

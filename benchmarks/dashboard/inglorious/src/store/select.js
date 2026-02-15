import { filterAndSortRows, getChartData } from "@benchmarks/dashboard-shared"

export const rows = (entities) => entities.table.data
const filter = (entities) => entities.metrics.filter
const sortBy = (entities) => entities.metrics.sortBy

export const filteredRows = (entities) => {
  return filterAndSortRows(rows(entities), filter(entities), sortBy(entities))
}

export const chartData = (chartEntity) => (entities) => {
  return getChartData(filteredRows(entities), chartEntity)
}

import { filterAndSortRows, getChartData } from "@benchmarks/dashboard-shared"

export const rows = (entities) => entities.table.data
export const filteredRows = (entities) => {
  return filterAndSortRows(rows(entities), filter(entities), sortBy(entities))
}

export const chartData = (chartEntity) => (entities) => {
  return getChartData(filteredRows(entities), chartEntity)
}

function filter(entities) {
  return entities.metrics.filter
}

function sortBy(entities) {
  return entities.metrics.sortBy
}

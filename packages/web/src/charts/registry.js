const chartTypes = new Map()

export function registerChartType(type, definition) {
  chartTypes.set(type, definition)
}

export function getChartType(type) {
  return chartTypes.get(type)
}

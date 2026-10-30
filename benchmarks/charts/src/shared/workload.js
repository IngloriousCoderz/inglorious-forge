export const DATA_POINTS = 100
export const PIE_SLICES = 10
export const UPDATE_INTERVAL_MS = 100
export const ROWS_PER_UPDATE = 2

export const CHART_WIDTH = 400
export const CHART_HEIGHT = 300
export const SERIES_COLOR = "#8884d8"
export const STROKE_WIDTH = 3
export const AREA_OPACITY = 0.3
export const GRID_COLOR = "#e5e7eb"
export const GRID_DASHARRAY = "5 5"
export const PIE_RADIUS = 80
export const PIE_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#64748b",
]

const MAX_VALUE = 1000
const DEFAULT_SEED = 42

/**
 * The datasets, by chart: `line`, `area`, `bar` and `pie`, each an array of
 * `{ name, value }`. `next()` changes ROWS_PER_UPDATE rows of each and returns
 * new datasets, leaving the previous ones untouched.
 */
export function createWorkload(seed = DEFAULT_SEED) {
  const random = createRandom(seed)
  const randomValue = () => Math.floor(random() * MAX_VALUE)
  const createRows = (count) =>
    Array.from({ length: count }, (_, index) => ({
      name: `Point ${index}`,
      value: randomValue(),
    }))
  const updateRows = (rows) => {
    const next = [...rows]
    for (let count = 0; count < ROWS_PER_UPDATE; count++) {
      const index = Math.floor(random() * next.length)
      next[index] = { ...next[index], value: randomValue() }
    }
    return next
  }

  let datasets = {
    line: createRows(DATA_POINTS),
    area: createRows(DATA_POINTS),
    bar: createRows(DATA_POINTS),
    pie: createRows(PIE_SLICES),
  }

  return {
    initial: datasets,
    next() {
      datasets = Object.fromEntries(
        Object.entries(datasets).map(([chart, rows]) => [
          chart,
          updateRows(rows),
        ]),
      )
      return datasets
    },
  }
}

function createRandom(seed) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

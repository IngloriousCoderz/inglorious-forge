export const ROWS_TO_GENERATE = 1000
export const ROWS_TO_UPDATE = 10
export const UPDATE_FREQUENCY = 10

export const MAX_VALUE = 1000
export const MAX_PROGRESS = 100
export const FPS_WINDOW = 10
export const FPS_BENCHMARK_SAMPLES = 30

const STATUS = ["Active", "Pending", "Inactive"]
const SAME = 0
const DEFAULT_AVG = 0

export const CHARTS = {
  chart1: {
    id: "chart1",
    type: "chart",
    title: "Progress Overview",
    rangeStart: 0,
    rangeEnd: 20,
  },
  chart2: {
    id: "chart2",
    type: "chart",
    title: "Value Distribution",
    rangeStart: 20,
    rangeEnd: 40,
  },
  chart3: {
    id: "chart3",
    type: "chart",
    title: "Live Updates",
    rangeStart: 40,
    rangeEnd: 60,
  },
  chart4: {
    id: "chart4",
    type: "chart",
    title: "Status Breakdown",
    rangeStart: 60,
    rangeEnd: 80,
  },
}

export const generateData = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `row_${i}`,
    rowId: i,
    name: `Item ${i}`,
    value: Math.floor(Math.random() * MAX_VALUE),
    status: STATUS[Math.floor(Math.random() * STATUS.length)],
    timestamp: Date.now(),
    progress: Math.floor(Math.random() * MAX_PROGRESS),
  }))
}

export const updateData = (rows, count) => {
  const nextRows = [...rows]

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * nextRows.length)
    nextRows[randomIndex] = {
      ...nextRows[randomIndex],
      value: Math.floor(Math.random() * MAX_VALUE),
      progress: Math.floor(Math.random() * MAX_PROGRESS),
      timestamp: Date.now(),
    }
  }

  return nextRows
}

export const filterAndSortRows = (rows, filter, sortBy) => {
  const normalizedFilter = filter.toLowerCase()

  return rows
    .filter(
      (row) =>
        row.name.toLowerCase().includes(normalizedFilter) ||
        row.status.toLowerCase().includes(normalizedFilter),
    )
    .sort((a, b) => {
      if (sortBy === "id") return a.id - b.id
      if (sortBy === "value") return b.value - a.value
      if (sortBy === "progress") return b.progress - a.progress
      return SAME
    })
}

export const getChartData = (rows, chart) => {
  const values = rows
    .slice(chart.rangeStart, chart.rangeEnd)
    .map((r) => r.value)
  const max = Math.max(...values)
  const avg = values.length
    ? Math.floor(values.reduce((a, b) => a + b, 0) / values.length)
    : DEFAULT_AVG

  return { title: chart.title, values, max, avg }
}

export const applyFpsSample = (metrics, fpsSample) => {
  const nextSamples = [...metrics.fpsSamples, fpsSample].slice(-FPS_WINDOW)
  const fpsAvg = Math.round(
    nextSamples.reduce((sum, value) => sum + value, 0) / nextSamples.length,
  )

  const currentBenchmark = metrics.benchmark ?? createFpsBenchmark()
  const nextBenchmark = currentBenchmark.done
    ? currentBenchmark
    : computeNextBenchmark(currentBenchmark, fpsSample)

  return {
    ...metrics,
    fpsNow: fpsSample,
    fpsSamples: nextSamples,
    fps: fpsAvg,
    benchmark: nextBenchmark,
  }
}

export const createFpsBenchmark = (target = FPS_BENCHMARK_SAMPLES) => ({
  target,
  done: false,
  count: 0,
  remaining: target,
  mean: 0,
  min: 0,
  max: 0,
  samples: [],
})

const computeNextBenchmark = (benchmark, fpsSample) => {
  const samples = [...benchmark.samples, fpsSample].slice(0, benchmark.target)
  const count = samples.length
  const sum = samples.reduce((acc, value) => acc + value, 0)
  const mean = Number((sum / count).toFixed(1))
  const min = Math.min(...samples)
  const max = Math.max(...samples)
  const done = count >= benchmark.target

  return {
    ...benchmark,
    samples,
    count,
    remaining: Math.max(benchmark.target - count, 0),
    mean,
    min,
    max,
    done,
  }
}

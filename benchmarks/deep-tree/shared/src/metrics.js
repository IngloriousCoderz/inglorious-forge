import { FPS_BENCHMARK_SAMPLES, FPS_WINDOW } from "./core"

const round = (value) => Math.round(value * 10) / 10

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

export const createInitialMetrics = () => ({
  fps: 60,
  fpsNow: 60,
  fpsSamples: [60],
  benchmark: createFpsBenchmark(),
  commitNow: 0,
  commitAvg10: 0,
  commitSamples: [],
  updateCount: 0,
})

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

export const applyCommitSample = (metrics, commitSample) => {
  const nextSamples = [...metrics.commitSamples, round(commitSample)].slice(
    -FPS_WINDOW,
  )
  const commitAvg10 = round(
    nextSamples.reduce((sum, value) => sum + value, 0) / nextSamples.length,
  )

  return {
    ...metrics,
    commitNow: round(commitSample),
    commitAvg10,
    commitSamples: nextSamples,
  }
}

const computeNextBenchmark = (benchmark, fpsSample) => {
  const samples = [...benchmark.samples, fpsSample].slice(0, benchmark.target)
  const count = samples.length
  const sum = samples.reduce((acc, value) => acc + value, 0)
  const mean = round(sum / count)
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

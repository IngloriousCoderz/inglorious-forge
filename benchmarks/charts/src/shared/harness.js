// Drives the updates and shows the frame rate, in plain DOM outside any
// framework, so every variant pays the same for them. `window.__benchmark`
// is what the runner (scripts/run.mjs) reads.

import { UPDATE_INTERVAL_MS } from "./workload.js"

const ONE_SECOND = 1000

/**
 * Applies the workload's next datasets every UPDATE_INTERVAL_MS.
 *
 * @param {(datasets: object) => void} applyDatasets - Hands the datasets to
 *   the variant's charts, all in one render.
 * @param {ReturnType<import("./workload.js").createWorkload>} workload
 * @returns {() => void} Stops the benchmark.
 */
export function runBenchmark(applyDatasets, workload) {
  const stats = { updates: 0, frames: 0 }
  window.__benchmark = stats

  const interval = setInterval(() => {
    applyDatasets(workload.next())
    stats.updates++
  }, UPDATE_INTERVAL_MS)

  // Shown before the first second is counted, so the box keeps its size.
  const fps = document.createElement("div")
  fps.className = "fps"
  fps.textContent = "– FPS"
  document.body.append(fps)

  let frameId
  let framesThisSecond = 0
  let secondStart = performance.now()
  const countFrame = (now) => {
    stats.frames++
    framesThisSecond++
    if (now - secondStart >= ONE_SECOND) {
      fps.textContent = `${Math.round((framesThisSecond * ONE_SECOND) / (now - secondStart))} FPS`
      framesThisSecond = 0
      secondStart = now
    }
    frameId = requestAnimationFrame(countFrame)
  }
  frameId = requestAnimationFrame(countFrame)

  return () => {
    clearInterval(interval)
    cancelAnimationFrame(frameId)
    fps.remove()
  }
}

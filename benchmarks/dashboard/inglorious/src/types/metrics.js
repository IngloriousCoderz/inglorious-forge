import {
  applyFpsSample,
  createFpsBenchmark,
} from "@benchmarks/dashboard-shared"
import { html } from "@inglorious/web"

const ERROR_FPS = 30
const WARN_FPS = 50

export const metrics = {
  create(entity) {
    entity.fps = 60
    entity.fpsNow = 60
    entity.fpsSamples = [60]
    entity.benchmark = createFpsBenchmark()
    entity.renderTime = 0
    entity.updateCount = 0
    entity.filter = ""
    entity.sortBy = "id"
  },

  setFPS(entity, fps) {
    Object.assign(entity, applyFpsSample(entity, fps))
  },

  setFilter(entity, filter) {
    entity.filter = filter
  },

  setSort(entity, sortBy) {
    entity.sortBy = sortBy
  },

  randomUpdate(entity) {
    const start = performance.now()
    entity.updateCount++
    entity.renderTime = Math.round(performance.now() - start)
  },

  render(entity) {
    const fpsClass =
      entity.fps < ERROR_FPS ? "error" : entity.fps < WARN_FPS ? "warning" : ""

    return html`
      <div class="metrics">
        <div class="metric ${fpsClass}">FPS(avg10): ${entity.fps}</div>
        <div class="metric">FPS(now): ${entity.fpsNow}</div>
        <div class="metric">
          30s:
          ${entity.benchmark.done
            ? "DONE"
            : `${entity.benchmark.remaining}s left`}
        </div>
        <div class="metric">
          Mean/Min/Max:
          ${entity.benchmark.mean}/${entity.benchmark.min}/${entity.benchmark
            .max}
        </div>
        <div class="metric">Update Time: ${entity.renderTime}ms</div>
        <div class="metric">Updates: ${entity.updateCount}</div>
      </div>
    `
  },
}

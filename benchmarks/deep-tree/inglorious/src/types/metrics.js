import {
  applyCommitSample,
  applyFpsSample,
  createInitialMetrics,
} from "@benchmarks/deep-tree-shared"
import { html } from "@inglorious/web"

const ERROR_FPS = 30
const WARN_FPS = 50

export const metrics = {
  create(entity) {
    Object.assign(entity, createInitialMetrics())
  },

  setFPS(entity, fps) {
    Object.assign(entity, applyFpsSample(entity, fps))
  },

  setCommit(entity, commitTime) {
    Object.assign(entity, applyCommitSample(entity, commitTime))
  },

  randomUpdate(entity) {
    entity.updateCount += 1
  },

  render(entity, api) {
    const fpsClass =
      entity.fps < ERROR_FPS ? "error" : entity.fps < WARN_FPS ? "warning" : ""

    const { totalNodes, totalLeaves } = api.getEntity("tree")

    return html`<div class="metrics">
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
        ${entity.benchmark.mean}/${entity.benchmark.min}/${entity.benchmark.max}
      </div>
      <div class="metric">Commit(avg10): ${entity.commitAvg10}ms</div>
      <div class="metric">Commit(now): ${entity.commitNow}ms</div>
      <div class="metric">Updates: ${entity.updateCount}</div>
      <div class="metric">Nodes: ${totalNodes}</div>
      <div class="metric">Leaves: ${totalLeaves}</div>
    </div>`
  },
}

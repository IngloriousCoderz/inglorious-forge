import { html } from "@inglorious/web"

const ERROR_FPS = 30
const WARN_FPS = 50

export const metrics = {
  init(entity) {
    entity.fps = 60
    entity.renderTime = 0
    entity.updateCount = 0
    entity.filter = ""
    entity.sortBy = "id"
  },

  setFPS(entity, fps) {
    entity.fps = fps
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
        <div class="metric ${fpsClass}">FPS: ${entity.fps}</div>
        <div class="metric">Update Time: ${entity.renderTime}ms</div>
        <div class="metric">Updates: ${entity.updateCount}</div>
      </div>
    `
  },
}

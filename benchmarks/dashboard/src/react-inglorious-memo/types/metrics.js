export const metrics = {
  create(entity) {
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
}

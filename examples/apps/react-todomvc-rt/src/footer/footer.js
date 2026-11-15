export const Footer = {
  filterChange(entity, id) {
    entity.activeFilter = id
  },

  completedClear(entity) {
    entity.activeFilter = "all"
  },
}

export const Footer = {
  filterClick(entity, id) {
    entity.activeFilter = id
  },

  clearClick(entity) {
    entity.activeFilter = "all"
  },
}

export const valueFilter = {
  render(entity, column, api) {
    return api.render(`${entity.id}-filter-${column.id}`)
  },
}

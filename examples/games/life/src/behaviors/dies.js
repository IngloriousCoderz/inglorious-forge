export function dies(grid) {
  return (type) => ({
    update(entity, dt, api) {
      if (entity.isDying) {
        grid.vacate(entity.row, entity.column)
        api.notify("remove", entity.id)
        return
      }

      type.update?.(entity, dt, api)
    },
  })
}

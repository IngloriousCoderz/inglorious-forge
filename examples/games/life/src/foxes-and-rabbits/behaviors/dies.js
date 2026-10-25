export function dies(grid) {
  return (type) => ({
    tick(entity, elapsed, api) {
      if (entity.isDying) {
        grid.vacate(entity.row, entity.column)
        api.notify("remove", entity.id)
        return
      }

      type.tick?.(entity, elapsed, api)
    },
  })
}

import { toPosition } from "../grid.js"

export function movesOnGrid(grid) {
  return (type) => ({
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      if (entity.isDying) {
        return
      }

      const target = grid.getRandomNeighbor([entity.row, entity.column])

      if (!target) {
        return
      }

      const [row, column] = target

      if (!grid.occupy(row, column, entity.id)) {
        return
      }

      grid.vacate(entity.row, entity.column)
      entity.row = row
      entity.column = column
      entity.position = toPosition(row, column)
    },
  })
}

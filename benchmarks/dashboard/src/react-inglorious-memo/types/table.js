import {
  generateData,
  MAX_VALUE,
  ROWS_TO_GENERATE,
  ROWS_TO_UPDATE,
  updateData,
} from "../../data"

export const table = {
  create(entity) {
    entity.data = generateData(ROWS_TO_GENERATE)
  },

  randomUpdate(entity) {
    entity.data = updateData(entity.data, ROWS_TO_UPDATE)
  },

  click(entity, id) {
    const index = entity.data.findIndex((row) => row.id === id)
    entity.data[index].value = Math.floor(Math.random() * MAX_VALUE)
  },
}

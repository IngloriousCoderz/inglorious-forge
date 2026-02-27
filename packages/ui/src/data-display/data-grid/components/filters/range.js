import { input } from "../../../../controls/input"
import { format } from "./helpers"

export const filterRange = [
  input,
  (type) => ({
    change(entity, payload, api) {
      const dataGrid = api.getEntity(entity._owner)
      const column = dataGrid.columns.find(
        (column) => column.id === (entity._column ?? entity.name),
      )

      type.change?.(entity, payload, api)

      const key = entity._key ?? "value"
      const formattedValue = payload ? format(payload, column.type) : null

      api.notify(`#${dataGrid.id}:filterChange`, {
        columnId: column.id,
        value: { ...dataGrid.filters[column.id], [key]: formattedValue },
      })
    },
  }),
]

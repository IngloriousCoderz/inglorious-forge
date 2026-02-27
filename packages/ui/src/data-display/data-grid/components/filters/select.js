import { select } from "../../../../controls/select"
import { format } from "./helpers"

export const filterSelect = [
  select,
  (type) => ({
    optionSelect(entity, payload, api) {
      const dataGrid = api.getEntity(entity._owner)
      const column = dataGrid.columns.find(
        (column) => column.id === entity.name,
      )

      type.optionSelect?.(entity, payload, api)

      const formattedValue = payload.value
        ? format(payload.value, column.type)
        : null

      api.notify(`#${dataGrid.id}:filterChange`, {
        columnId: column.id,
        value: formattedValue,
      })
    },
  }),
]

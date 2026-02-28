import { select } from "../../../controls/select"
import { format } from "./helpers"

export const selectFilter = {
  render(entity, column, api) {
    return select.render({
      name: column.id,
      size: "sm",
      fullWidth: true,
      options: column.filter.options,
      onChange: (value) => {
        const formattedValue = value ? format(value, column.type) : null
        api.notify(`#${entity.id}:filterChange`, {
          columnId: column.id,
          value: formattedValue,
        })
      },
    })
  },
}

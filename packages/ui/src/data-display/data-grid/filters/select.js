import { Select } from "../../../controls/select/index.js"
import { format } from "./helpers.js"

export const SelectFilter = {
  render(entity, column) {
    return Select.render({
      name: column.id,
      size: "sm",
      isFullWidth: true,
      options: column.filter.options,
      onChange: (value) => {
        const formattedValue = value ? format(value, column.type) : null
        entity.onFilterChange?.({ columnId: column.id, value: formattedValue })
      },
    })
  },
}

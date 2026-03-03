import { input } from "../../../controls/input"
import { format } from "./helpers"

const DEFAULT_PLACEHOLDER = {
  number: "=",
  text: "Contains...",
}

export const inputFilter = {
  render(entity, column) {
    return input.render({
      name: column.id,
      inputType: column.filter.type,
      placeholder:
        column.filter.placeholder ?? DEFAULT_PLACEHOLDER[column.filter.type],
      size: "sm",
      fullWidth: true,
      onChange: (value) => {
        const formattedValue = value ? format(value, column.type) : null
        entity.onFilterChange?.({ columnId: column.id, value: formattedValue })
      },
    })
  },
}

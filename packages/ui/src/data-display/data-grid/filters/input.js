import { Input } from "../../../controls/input"
import { format } from "./helpers"

const DEFAULT_PLACEHOLDER = {
  number: "=",
  text: "Contains...",
}

export const InputFilter = {
  render(entity, column) {
    return Input.render({
      name: column.id,
      inputType: column.filter.type,
      placeholder:
        column.filter.placeholder ?? DEFAULT_PLACEHOLDER[column.filter.type],
      size: "sm",
      isFullWidth: true,
      onChange: (value) => {
        const formattedValue = value ? format(value, column.type) : null
        entity.onFilterChange?.({ columnId: column.id, value: formattedValue })
      },
    })
  },
}

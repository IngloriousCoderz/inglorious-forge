import { Input } from "../../../controls/input/index.js"
import { format, toField } from "./helpers.js"

const DEFAULT_PLACEHOLDER = {
  number: "=",
  text: "Contains...",
}

export const InputFilter = {
  render(entity, column) {
    return Input.render({
      name: column.id,
      ariaLabel: column.filter.ariaLabel ?? `Filter ${column.title}`,
      inputType: column.filter.type,
      value: toField(entity.filters[column.id], column.filter.type),
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

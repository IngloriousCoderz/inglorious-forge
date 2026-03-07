import { html } from "@inglorious/web"

import { input } from "../../../controls/input"
import { format } from "./helpers"

const RANGE_TYPE = {
  range: "number",
  date: "date",
  time: "time",
  datetime: "datetime-local",
}

export const rangeFilter = {
  render(entity, column) {
    return html`<div class="iw-data-grid-filter-range">
      ${input.render({
        name: `${column.id}Min`,
        inputType: RANGE_TYPE[column.filter.type],
        placeholder: column.filter.placeholder ?? "≥",
        size: "sm",
        fullWidth: true,
        className: "iw-data-grid-filter-range-input",
        onChange: (value) => {
          const formattedValue = value ? format(value, column.type) : null
          entity.onFilterChange?.({
            columnId: column.id,
            value: { ...entity.filters[column.id], min: formattedValue },
          })
        },
      })}
      ${input.render({
        name: `${column.id}Max`,
        inputType: RANGE_TYPE[column.filter.type],
        placeholder: column.filter.placeholder ?? "≤",
        size: "sm",
        fullWidth: true,
        className: "iw-data-grid-filter-range-input",
        onChange: (value) => {
          const formattedValue = value ? format(value, column.type) : null
          entity.onFilterChange?.({
            columnId: column.id,
            value: { ...entity.filters[column.id], max: formattedValue },
          })
        },
      })}
    </div>`
  },
}

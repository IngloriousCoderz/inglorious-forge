import { html } from "@inglorious/web"

import { Input } from "../../../controls/input/index.js"
import { format } from "./helpers.js"

const RANGE_TYPE = {
  range: "number",
  date: "date",
  time: "time",
  datetime: "datetime-local",
}

export const RangeFilter = {
  render(entity, column) {
    return html`<div class="iw-data-grid-filter-range">
      ${Input.render({
        name: `${column.id}Min`,
        inputType: RANGE_TYPE[column.filter.type],
        placeholder: column.filter.placeholder ?? "≥",
        size: "sm",
        isFullWidth: true,
        onChange: (value) => {
          const formattedValue = value ? format(value, column.type) : null
          entity.onFilterChange?.({
            columnId: column.id,
            value: { ...entity.filters[column.id], min: formattedValue },
          })
        },
      })}
      ${Input.render({
        name: `${column.id}Max`,
        inputType: RANGE_TYPE[column.filter.type],
        placeholder: column.filter.placeholder ?? "≤",
        size: "sm",
        isFullWidth: true,
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

import { html } from "@inglorious/web"

import { input } from "../../../controls/input"

export const rangeFilter = {
  render(entity, column, api) {
    const filter = entity.filters[column.id] ?? {}

    const wrappedApi = {
      ...api,
      notify(event, payload) {
        if (event === `#${entity.id}-${column.id}Min:change`) {
          const formattedValue = payload ? Number(payload) : null
          api.notify(`#${entity.id}:filterChange`, {
            columnId: column.id,
            value: { ...filter, min: formattedValue },
          })
          return
        }

        if (event === `#${entity.id}-${column.id}Max:change`) {
          const formattedValue = payload ? Number(payload) : null
          api.notify(`#${entity.id}:filterChange`, {
            columnId: column.id,
            value: { ...filter, max: formattedValue },
          })
          return
        }

        api.notify(event, payload)
      },
    }

    return html`${input.render(
      {
        id: `${entity.id}-${column.id}Min`,
        type: "input",
        name: `${column.id}Min`,
        inputType: "number",
        placeholder: column.filter.placeholder ?? "≥",
        value: filter.min,
        size: "sm",
        fullWidth: true,
      },
      wrappedApi,
    )}
    ${input.render(
      {
        id: `${entity.id}-${column.id}Max`,
        type: "input",
        name: `${column.id}Max`,
        inputType: "number",
        placeholder: column.filter.placeholder ?? "≤",
        value: filter.max,
        size: "sm",
        fullWidth: true,
      },
      wrappedApi,
    )}`
  },
}

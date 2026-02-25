import { html } from "@inglorious/web"

import { select } from "../../../controls/select"

export const selectFilter = {
  render(entity, column, api) {
    const wrappedApi = {
      ...api,
      notify(event, payload) {
        if (event === `#${entity.id}-${column.id}:change`) {
          const formattedValue = payload ? format(payload, column.type) : null

          api.notify(`#${entity.id}:filterChange`, {
            columnId: column.id,
            value: formattedValue,
          })
          return
        }

        api.notify(event, payload)
      },
    }

    return html`${select.render(
      {
        id: `${entity.id}-${column.id}`,
        type: "select",
        name: column.id,
        multiple: column.filter.isMultiple,
        autocomplete: "off",
        value: entity.filters[column.id],
        options: column.filter.options,
        size: "sm",
        fullWidth: true,
      },
      wrappedApi,
    )}`
  },
}

function format(value, type) {
  if (type === "number") return Number(value)
  if (type === "boolean")
    return value === "true" ? true : value === "false" ? false : null
  if (["date", "time", "datetime"].includes(type))
    return new Date(value).getTime()
  return value
}

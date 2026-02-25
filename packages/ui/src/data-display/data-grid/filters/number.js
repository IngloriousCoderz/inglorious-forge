import { html } from "@inglorious/web"

import { input } from "../../../controls/input"

export const numberFilter = {
  render(entity, column, api) {
    const wrappedApi = {
      ...api,
      notify(event, payload) {
        if (event === `#${entity.id}-${column.id}:change`) {
          const formattedValue = payload ? Number(payload) : null

          api.notify(`#${entity.id}:filterChange`, {
            columnId: column.id,
            value: formattedValue,
          })
          return
        }

        api.notify(event, payload)
      },
    }

    return html`${input.render(
      {
        id: `${entity.id}-${column.id}`,
        type: "input",
        name: column.id,
        inputType: "number",
        placeholder: column.filter.placeholder ?? "=",
        value: entity.filters[column.id],
        size: "sm",
        fullWidth: true,
      },
      wrappedApi,
    )}`
  },
}

import { html } from "@inglorious/web"

import { input } from "../../../controls/input"

const INPUT_TYPE = {
  date: "date",
  time: "time",
  datetime: "datetime-local",
}

export const dateFilter = {
  render(entity, column, api) {
    const filter = entity.filters[column.id] ?? {}

    const wrappedApi = {
      ...api,
      notify(event, payload) {
        if (event === `#${entity.id}-${column.id}Min:change`) {
          const formattedValue = payload ? new Date(payload).getTime() : null
          api.notify(`#${entity.id}:filterChange`, {
            columnId: column.id,
            value: { ...filter, min: formattedValue },
          })
          return
        }

        if (event === `#${entity.id}-${column.id}Max:change`) {
          const formattedValue = payload ? new Date(payload).getTime() : null
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
        id: `${entity.id}-${column.id}Min:change`,
        type: "input",
        name: `${column.id}Min`,
        inputType: INPUT_TYPE[column.filter.type],
        value: entity.filters[column.id],
        size: "sm",
        fullWidth: true,
      },
      wrappedApi,
    )}
    ${input.render(
      {
        id: `${entity.id}-${column.id}Max:change`,
        type: "input",
        name: `${column.id}Max`,
        inputType: INPUT_TYPE[column.filter.type],
        value: entity.filters[column.id],
        size: "sm",
        fullWidth: true,
      },
      wrappedApi,
    )}`
  },
}

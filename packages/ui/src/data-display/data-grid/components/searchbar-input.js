import { input } from "../../../controls/input"

export const searchbarInput = [
  input,
  (type) => ({
    change(entity, payload, api) {
      type.change?.(entity, payload, api)

      api.notify(`#${entity._owner}:searchChange`, payload)
    },
  }),
]

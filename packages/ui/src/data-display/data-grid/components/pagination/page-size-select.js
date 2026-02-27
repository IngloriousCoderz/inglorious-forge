import { select } from "../../../../controls/select"

export const pageSizeSelect = [
  select,
  (type) => ({
    optionSelect(entity, payload, api) {
      type.optionSelect?.(entity, payload, api)

      api.notify(`#${entity._owner}:pageSizeChange`, Number(payload.value))
    },
  }),
]

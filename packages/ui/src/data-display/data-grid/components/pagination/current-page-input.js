import { input } from "../../../../controls/input"

const PRETTY_PAGE = 1

export const currentPageInput = [
  input,
  (type) => ({
    change(entity, payload, api) {
      type.change?.(entity, payload, api)

      api.notify(`#${entity._owner}:pageChange`, Number(payload) - PRETTY_PAGE)
    },

    render(entity, api) {
      const dataGrid = api.getEntity(entity._owner)
      return type.render(
        { ...entity, value: dataGrid.pagination.page + PRETTY_PAGE },
        api,
      )
    },
  }),
]

import { button } from "../../../../controls/button"
import { getPaginationInfo } from "../../helpers"

const FIRST_PAGE = 0

export const firstPageButton = [
  button,
  (type) => ({
    click(entity, payload, api) {
      type.click?.(entity, payload, api)

      api.notify(`#${entity._owner}:pageChange`, FIRST_PAGE)
    },

    render(entity, api) {
      const dataGrid = api.getEntity(entity._owner)
      const pagination = getPaginationInfo(dataGrid)
      return type.render({ ...entity, disabled: !pagination.hasPrevPage }, api)
    },
  }),
]

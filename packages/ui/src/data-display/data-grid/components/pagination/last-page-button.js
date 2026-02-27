import { button } from "../../../../controls/button"
import { getPaginationInfo } from "../../helpers"

const LAST_PAGE = 1

export const lastPageButton = [
  button,
  (type) => ({
    click(entity, payload, api) {
      type.click?.(entity, payload, api)

      const dataGrid = api.getEntity(entity._owner)
      const pagination = getPaginationInfo(dataGrid)

      api.notify(
        `#${entity._owner}:pageChange`,
        pagination.totalPages - LAST_PAGE,
      )
    },

    render(entity, api) {
      const dataGrid = api.getEntity(entity._owner)
      const pagination = getPaginationInfo(dataGrid)
      return type.render({ ...entity, disabled: !pagination.hasNextPage }, api)
    },
  }),
]

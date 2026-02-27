import { button } from "../../../../controls/button"
import { getPaginationInfo } from "../../helpers"

export const nextPageButton = [
  button,
  (type) => ({
    click(entity, payload, api) {
      type.click?.(entity, payload, api)

      api.notify(`#${entity._owner}:pageNext`)
    },

    render(entity, api) {
      const dataGrid = api.getEntity(entity._owner)
      const pagination = getPaginationInfo(dataGrid)
      return type.render({ ...entity, disabled: !pagination.hasNextPage }, api)
    },
  }),
]

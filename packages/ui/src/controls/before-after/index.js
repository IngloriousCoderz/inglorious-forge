import * as handlers from "./handlers.js"
import { BeforeAfter as renderers } from "./template.js"

export const BeforeAfter = {
  ...handlers,
  ...renderers,
  render(entity, api) {
    const id = entity.id
    const props = {
      ...entity,
      onPositionChange: (position) =>
        api.notify(`#${id}:positionChange`, position),
    }

    return this.renderBeforeAfter(props)
  },
}

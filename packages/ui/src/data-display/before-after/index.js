import * as handlers from "./handlers.js"
import { template } from "./template.js"

export const BeforeAfter = {
  ...handlers,
  ...template,
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

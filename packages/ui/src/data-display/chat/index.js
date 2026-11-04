import * as handlers from "./handlers.js"
import { template } from "./template.js"

export const Chat = {
  ...handlers,
  ...template,
  render(entity, api) {
    const id = entity.id
    const props = {
      ...entity,
      onDraftChange: (draft) => api.notify(`#${id}:draftChange`, draft),
      onSend: (text) => api.notify(`#${id}:messageSend`, text),
      renderEntity: (entityId) => api.render(entityId),
    }

    return this.renderChat(props)
  },
}

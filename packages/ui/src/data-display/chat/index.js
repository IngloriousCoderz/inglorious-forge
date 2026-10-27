import * as handlers from "./handlers.js"
import { Chat as renderers } from "./template.js"

export const Chat = {
  ...handlers,
  ...renderers,
  render(entity, api) {
    const id = entity.id
    const props = {
      ...entity,
      onDraftChange: (draft) => api.notify(`#${id}:draftChange`, draft),
      onSend: (text) => api.notify(`#${id}:messageSend`, text),
      // A message naming an entity, such as a generated answer, shows it.
      renderEntity: (entityId) => api.render(entityId),
    }

    return this.renderChat(props)
  },
}

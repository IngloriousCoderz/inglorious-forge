import type { MessageType } from "../../types"

export const message: MessageType = {
  click(entity) {
    entity.isUpperCase = !entity.isUpperCase
  },

  render(entity, api) {
    const message = entity.isUpperCase ? entity.who.toUpperCase() : entity.who
    return (
      <span onClick={() => api.notify(`#${entity.id}:click`)}>
        Hello {message}
      </span>
    )
  },
}

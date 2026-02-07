import { html } from "@inglorious/web"

import type { MessageType } from "../../types"

export const message: MessageType = {
  click(entity) {
    entity.isUpperCase = !entity.isUpperCase
  },

  render(entity, api) {
    const who = entity.isUpperCase ? entity.who.toUpperCase() : entity.who
    return html`<span @click=${() => api.notify(`#${entity.id}:click`)}
      >Hello ${who}</span
    >`
  },
}

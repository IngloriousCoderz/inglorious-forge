import { html } from "@inglorious/web"

export const template = {
  render(entity) {
    return html`<div class="shared-pill ${entity.mode}">${entity.label}</div>`
  },
}

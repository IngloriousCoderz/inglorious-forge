import { html } from "@inglorious/web"

export function render(entity) {
  return html`<div class="shared-pill ${entity.mode}">${entity.label}</div>`
}

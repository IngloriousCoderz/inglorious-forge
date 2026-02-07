import { html } from "@inglorious/web"

export const message = {
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

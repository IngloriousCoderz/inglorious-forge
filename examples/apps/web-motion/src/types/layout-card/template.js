import { html } from "@inglorious/web"

export const template = {
  render(entity, api) {
    return html`
      <article class="layout-card" style="--card:${entity.color}">
        <strong>${entity.label}</strong>
        <button @click=${() => api.notify(`#${entity.id}:pulse`)}>Pulse</button>
      </article>
    `
  },
}

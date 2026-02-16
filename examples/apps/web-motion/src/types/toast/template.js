import { html } from "@inglorious/web"

export function render(entity, api) {
  return html`
    <article class="toast">
      <div>
        <strong>${entity.title}</strong>
        <p>${entity.message}</p>
      </div>

      <button @click=${() => api.notify(`#${entity.id}:dismiss`)}>
        Dismiss
      </button>
    </article>
  `
}

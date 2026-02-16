import { html, repeat } from "@inglorious/web"

export function render(entity, api) {
  const toasts = api.getEntities("toast")

  return html`
    <section class="stack">
      <h2>Presence Demo</h2>

      <button @click=${() => api.notify(`#${entity.id}:addToast`)}>
        Add toast
      </button>

      <div class="toast-list">
        ${repeat(
          toasts,
          (item) => item.id,
          (item) => api.render(item.id),
        )}
      </div>
    </section>
  `
}

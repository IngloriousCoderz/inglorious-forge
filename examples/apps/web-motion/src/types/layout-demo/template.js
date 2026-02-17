import { html, repeat } from "@inglorious/web"

export function render(entity, api) {
  return html`
    <section class="stack">
      <h2>Layout FLIP</h2>
      <p>Shuffle cards to animate DOM reflow with FLIP.</p>
      <button @click=${() => api.notify(`#${entity.id}:shuffle`)}>
        Shuffle layout
      </button>

      <div class="layout-grid">
        ${repeat(
          entity.order,
          (id) => id,
          (id) => api.render(id),
        )}
      </div>
    </section>
  `
}

import { html } from "@inglorious/web"

export function render(entity, api) {
  return html`
    <section class="card">
      <h2>Motion Type</h2>
      <p>Variant: <code>${entity.motionVariant}</code></p>
      <button @click=${() => api.notify(`#${entity.id}:toggle`)}>
        Toggle variant
      </button>
    </section>
  `
}

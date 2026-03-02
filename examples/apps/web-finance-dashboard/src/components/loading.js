import { html } from "@inglorious/web"

export function renderInlineLoader(label) {
  return html`
    <div class="inline-loader">
      <span class="spinner" aria-hidden="true"></span>
      <span>${label}</span>
    </div>
  `
}

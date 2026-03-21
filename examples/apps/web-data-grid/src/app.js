import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`<main class="iw-theme-bootstrap iw-theme-light">
      <h1>Product Table</h1>
      ${api.render("productTable")}
    </main>`
  },
}

import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`<div class="app">
      <div class="header">
        <div class="title">Deep Tree Sparse Updates: Inglorious Web</div>
        ${api.render("metrics")}
      </div>

      ${api.render("tree")}
    </div>`
  },
}

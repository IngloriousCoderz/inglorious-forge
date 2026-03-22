import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`<div class="iw-theme-bootstrap iw-theme-light">
      ${api.render("dataGrid")}
    </div>`
  },
}

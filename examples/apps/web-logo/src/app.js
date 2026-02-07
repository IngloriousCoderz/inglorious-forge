import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`${api.render("logoForm")}
      <div class="frame">${api.render("liveLogo")}</div>`
  },
}

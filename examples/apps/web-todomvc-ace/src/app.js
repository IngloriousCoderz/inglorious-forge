import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`${api.render("form")}${api.render("list")}${api.render(
      "footer",
    )}`
  },
}

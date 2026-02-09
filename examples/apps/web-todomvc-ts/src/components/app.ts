import { type Api, html } from "@inglorious/web"

export const app = {
  render(api: Api) {
    return html`${api.render("form")}${api.render("list")}${api.render(
      "footer",
    )}`
  },
}

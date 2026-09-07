import { html } from "@inglorious/web"

import type { AppApi } from "../../types"

export const app = {
  render(api: AppApi) {
    return html`${api.render("form")}${api.render("list")}${api.render(
      "footer",
    )}`
  },
}

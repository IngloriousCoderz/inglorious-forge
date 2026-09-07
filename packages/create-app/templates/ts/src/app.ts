import { html } from "@inglorious/web"

import type { AppApi } from "../types"

export const App = {
  render(props: Record<string, unknown> | null, api: AppApi) {
    return html`<h1>
      ${api.render("message1")}, ${api.render("message2")},
      ${api.render("message3")}!
    </h1>`
  },
}

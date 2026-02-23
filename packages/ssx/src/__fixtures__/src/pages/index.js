import "@inglorious/logo/style.css"

import { html } from "@inglorious/web"

import { nav } from "../components/nav.js"

export const index = {
  render(_, api) {
    return html`<h1>Index</h1>
      <div>${api.render("logo")} ${nav.render()}</div>`
  },
}

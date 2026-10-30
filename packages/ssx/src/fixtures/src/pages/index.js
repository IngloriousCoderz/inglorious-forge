import "@inglorious/logo/style.css"

import { html } from "@inglorious/web"

import { Nav } from "../components/nav.js"

export const Index = {
  render(_, api) {
    return html`<h1>Index</h1>
      <div>${api.render("logo")} ${Nav.render()}</div>`
  },
}

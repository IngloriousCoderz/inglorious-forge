import { html } from "@inglorious/web"

import { Nav } from "../../components/nav.js"

export const Api = {
  render() {
    return html`<h1>API</h1>
      ${Nav.render()}`
  },
}

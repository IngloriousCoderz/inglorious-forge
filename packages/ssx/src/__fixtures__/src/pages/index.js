import "@inglorious/logo/style.css"

// import { startInteraction, stopInteraction } from "@inglorious/logo"
import { html } from "@inglorious/web"

import { Nav } from "../components/nav.js"

export const Index = {
  // TODO: this prevents logo events from firing on other pages, but it breaks the index when built!
  // routeChange(entity, payload, api) {
  //   if (payload.route === entity.id) {
  //     const logo = api.getEntity("logo")
  //     startInteraction(logo, api)
  //   } else {
  //     stopInteraction()
  //   }
  // },

  render(_, api) {
    return html`<h1>Index</h1>
      <div>${api.render("logo")} ${Nav.render()}</div>`
  },
}

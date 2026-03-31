import { html } from "@inglorious/web"

export const App = {
  render(props, api) {
    return html`<h1>
      ${api.render("message1")}, ${api.render("message2")},
      ${api.render("message3")}!
    </h1>`
  },
}

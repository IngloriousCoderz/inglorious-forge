import { type Api, html } from "@inglorious/web"

export const App = {
  render(props: Record<string, unknown> | null, api: Api) {
    return html`<h1>
      ${api.render("message1")}, ${api.render("message2")},
      ${api.render("message3")}!
    </h1>`
  },
}

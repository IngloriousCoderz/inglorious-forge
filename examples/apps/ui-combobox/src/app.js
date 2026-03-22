import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`<main class="iw-theme-bootstrap iw-theme-light">
      <h1>Combobox</h1>

      <div>
        <h2>Single Select</h2>
        ${api.render("countrySelect")}
      </div>

      <div>
        <h2>Multi Select</h2>
        ${api.render("multiSelect")}
      </div>

      <div>
        <h2>Remote Select</h2>
        ${api.render("remoteSelect")}
      </div>
    </main>`
  },
}

import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`
      <main class="app-shell">
        <header>
          <h1>@inglorious/motion</h1>
          <p>
            Native type composition + WAAPI lifecycle, FLIP and shared layout.
          </p>
        </header>

        ${api.render("motionPanel")} ${api.render("playground")}
        ${api.render("layoutDemo")} ${api.render("sharedDemo")}
      </main>
    `
  },
}

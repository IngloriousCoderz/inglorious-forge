import { AppBar } from "@inglorious/ui/app-bar"
import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`<div class="iw-theme-bootstrap iw-theme-light pos">
      ${AppBar.render({
        title: "NextGen POS",
        subtitle: "Craig Larman’s case study, built with Inglorious Forge",
        color: "primary",
      })}
      <main class="pos-layout">
        <section>${api.render("register")}</section>
        <aside class="pos-aside">
          ${api.render("settings")} ${api.render("history")}
        </aside>
      </main>
    </div>`
  },
}

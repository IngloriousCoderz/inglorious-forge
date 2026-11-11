import { AppBar } from "@inglorious/ui/app-bar"
import { BottomNavigation } from "@inglorious/ui/bottom-navigation"
import { IconButton } from "@inglorious/ui/icon-button"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

import { tabOf, tabs } from "./tabs.js"

const BACK = -1
const TITLES = {
  inbox: "Inbox",
  message: "Message",
  haptics: "Haptics",
  settings: "Settings",
}

export const app = {
  render(api) {
    const router = api.getEntity("router")
    const isMessage = router.route === "message"

    return html`
      <header class="chrome app-bar">
        ${AppBar.render({
          title: TITLES[router.route] ?? "ui-mobile",
          leading: when(isMessage, () =>
            IconButton.render({
              variant: "ghost",
              icon: "‹",
              ariaLabel: "Back",
              onClick: () => api.notify("#router:navigate", BACK),
            }),
          ),
        })}
      </header>

      <main class="content">
        ${when(router.route, () => api.render(router.route))}
      </main>

      <footer class="chrome tab-bar">
        ${BottomNavigation.render({
          value: tabs[tabOf(router.route)]?.value,
          actions: tabs,
          onChange: (value) => {
            const tab = tabs.find((tab) => tab.value === value)
            api.notify("#router:navigate", tab.path)
          },
        })}
      </footer>

      ${api.render("notice")}
    `
  },
}

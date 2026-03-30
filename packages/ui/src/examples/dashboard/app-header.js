import { html } from "@inglorious/web"

import { button } from "../../controls/button"
import { avatar } from "../../data-display/avatar"
import { divider } from "../../data-display/divider"
import { icon } from "../../data-display/icon"
import { materialIcon } from "../../data-display/material-icon"
import { flex } from "../../layout/flex"
import { breadcrumbs } from "../../navigation/breadcrumbs"
import { appBar } from "../../surfaces/app-bar"

export const AppHeader = {
  render(entity, api) {
    const themeEntity = api.getEntity("theme")
    const modeEntity = api.getEntity("mode")
    const themeMode = modeEntity?.mode ?? "auto"
    const themeName = themeEntity?.theme ?? "inglorious"
    const themeIcon =
      themeName === "bootstrap"
        ? "fa-brands fa-bootstrap"
        : themeName === "material"
          ? "fa-brands fa-android"
          : "fa-solid fa-gamepad"
    const modeIcon =
      themeMode === "light"
        ? "light_mode"
        : themeMode === "dark"
          ? "dark_mode"
          : "contrast"

    return html`
      <div class="iw-dashboard-header">
        ${appBar.render({
          position: "static",
          elevated: false,
          children: html`
            ${flex.render({
              justify: "between",
              align: "center",
              gap: "md",
              className: "iw-dashboard-header-row",
              children: [
                button.render({
                  color: "secondary",
                  variant: "ghost",
                  shape: "square",
                  children: materialIcon.render({ name: "menu", size: "lg" }),
                  "aria-label": "Toggle navigation",
                  onClick: () => api.notify(`#appDrawer:toggle`),
                }),
                flex.render({
                  align: "center",
                  gap: "sm",
                  className: "iw-dashboard-header-nav",
                  children: [
                    button.render({
                      color: "secondary",
                      variant: "ghost",
                      children: "Dashboard",
                    }),
                    button.render({
                      color: "secondary",
                      variant: "ghost",
                      children: "Users",
                    }),
                    button.render({
                      color: "secondary",
                      variant: "ghost",
                      children: "Settings",
                    }),
                  ],
                }),
                flex.render({
                  align: "center",
                  gap: "sm",
                  className: "iw-dashboard-header-actions",
                  children: [
                    button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: materialIcon.render({
                        name: "notifications",
                        size: "lg",
                      }),
                      "aria-label": "Notifications",
                    }),
                    button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: materialIcon.render({
                        name: "format_list_bulleted",
                      }),
                      "aria-label": "Tasks",
                    }),
                    button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: materialIcon.render({
                        name: "mail",
                        size: "lg",
                      }),
                      "aria-label": "Messages",
                    }),
                    divider.render({ orientation: "vertical" }),

                    button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: icon.render({
                        children: html`<i class=${themeIcon}></i>`,
                        size: "lg",
                      }),
                      "aria-label": `Theme: ${themeName}`,
                      onClick: () => api.notify("#theme:toggle"),
                    }),
                    button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: materialIcon.render({
                        name: modeIcon,
                        size: "lg",
                      }),
                      "aria-label": `Mode: ${themeMode}`,
                      onClick: () => api.notify("#mode:toggle"),
                    }),
                    divider.render({ orientation: "vertical" }),
                    avatar.render({ src: "/antony.jpeg" }),
                  ],
                }),
              ],
            })}
          `,
        })}
        ${flex.render({
          align: "center",
          className: "iw-dashboard-header-row iw-dashboard-breadcrumbs",
          children: breadcrumbs.render({
            items: [{ label: "Home", href: "#" }, { label: "Dashboard" }],
          }),
        })}
      </div>
    `
  },
}

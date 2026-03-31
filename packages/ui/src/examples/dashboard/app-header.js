import { html } from "@inglorious/web"

import { Button } from "../../controls/button"
import { Avatar } from "../../data-display/avatar"
import { Divider } from "../../data-display/divider"
import { Icon } from "../../data-display/icon"
import { MaterialIcon } from "../../data-display/material-icon"
import { Flex } from "../../layout/flex"
import { Breadcrumbs } from "../../navigation/breadcrumbs"
import { AppBar } from "../../surfaces/app-bar"

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
        ${AppBar.render({
          position: "static",
          elevated: false,
          children: html`
            ${Flex.render({
              justify: "between",
              align: "center",
              gap: "md",
              className: "iw-dashboard-header-row",
              children: [
                Button.render({
                  color: "secondary",
                  variant: "ghost",
                  shape: "square",
                  children: MaterialIcon.render({ name: "menu", size: "lg" }),
                  "aria-label": "Toggle navigation",
                  onClick: () => api.notify(`#appDrawer:toggle`),
                }),
                Flex.render({
                  align: "center",
                  gap: "sm",
                  className: "iw-dashboard-header-nav",
                  children: [
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      children: "Dashboard",
                    }),
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      children: "Users",
                    }),
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      children: "Settings",
                    }),
                  ],
                }),
                Flex.render({
                  align: "center",
                  gap: "sm",
                  className: "iw-dashboard-header-actions",
                  children: [
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: MaterialIcon.render({
                        name: "notifications",
                        size: "lg",
                      }),
                      "aria-label": "Notifications",
                    }),
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: MaterialIcon.render({
                        name: "format_list_bulleted",
                      }),
                      "aria-label": "Tasks",
                    }),
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: MaterialIcon.render({
                        name: "mail",
                        size: "lg",
                      }),
                      "aria-label": "Messages",
                    }),
                    Divider.render({ orientation: "vertical" }),

                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: Icon.render({
                        children: html`<i class=${themeIcon}></i>`,
                        size: "lg",
                      }),
                      "aria-label": `Theme: ${themeName}`,
                      onClick: () => api.notify("#theme:toggle"),
                    }),
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: MaterialIcon.render({
                        name: modeIcon,
                        size: "lg",
                      }),
                      "aria-label": `Mode: ${themeMode}`,
                      onClick: () => api.notify("#mode:toggle"),
                    }),
                    Divider.render({ orientation: "vertical" }),
                    Avatar.render({ src: "/antony.jpeg" }),
                  ],
                }),
              ],
            })}
          `,
        })}
        ${Flex.render({
          align: "center",
          className: "iw-dashboard-header-row iw-dashboard-breadcrumbs",
          children: Breadcrumbs.render({
            items: [{ label: "Home", href: "#" }, { label: "Dashboard" }],
          }),
        })}
      </div>
    `
  },
}

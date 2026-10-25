import android from "@iconify-icons/fa7-brands/android"
import bootstrap from "@iconify-icons/fa7-brands/bootstrap"
import gamepad from "@iconify-icons/fa7-solid/gamepad"
import contrastOutline from "@iconify-icons/material-symbols/contrast-outline"
import darkModeOutline from "@iconify-icons/material-symbols/dark-mode-outline"
import formatListBulletedOutline from "@iconify-icons/material-symbols/format-list-bulleted-outline"
import lightModeOutline from "@iconify-icons/material-symbols/light-mode-outline"
import mailOutline from "@iconify-icons/material-symbols/mail-outline"
import menuOutline from "@iconify-icons/material-symbols/menu-outline"
import notificationsOutline from "@iconify-icons/material-symbols/notifications-outline"
import { html } from "@inglorious/web"

import { Button } from "../../controls/button/index.js"
import { Avatar } from "../../data-display/avatar/index.js"
import { Divider } from "../../data-display/divider/index.js"
import { Icon } from "../../data-display/icon/index.js"
import { Flex } from "../../layout/flex/index.js"
import { Breadcrumbs } from "../../navigation/breadcrumbs/index.js"
import { AppBar } from "../../surfaces/app-bar/index.js"

export const AppHeader = {
  render(entity, api) {
    const themeEntity = api.getEntity("theme")
    const modeEntity = api.getEntity("mode")
    const themeMode = modeEntity?.mode ?? "auto"
    const themeName = themeEntity?.theme ?? "inglorious"
    const themeIcon =
      themeName === "bootstrap"
        ? bootstrap
        : themeName === "material"
          ? android
          : gamepad
    const modeIcon =
      themeMode === "light"
        ? lightModeOutline
        : themeMode === "dark"
          ? darkModeOutline
          : contrastOutline

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
                  children: Icon.render({ icon: menuOutline, size: "lg" }),
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
                      children: Icon.render({
                        icon: notificationsOutline,
                        size: "lg",
                      }),
                      "aria-label": "Notifications",
                    }),
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: Icon.render({
                        icon: formatListBulletedOutline,
                      }),
                      "aria-label": "Tasks",
                    }),
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: Icon.render({
                        icon: mailOutline,
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
                        icon: themeIcon,
                        size: "lg",
                      }),
                      "aria-label": `Theme: ${themeName}`,
                      onClick: () => api.notify("#theme:toggle"),
                    }),
                    Button.render({
                      color: "secondary",
                      variant: "ghost",
                      shape: "square",
                      children: Icon.render({
                        icon: modeIcon,
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

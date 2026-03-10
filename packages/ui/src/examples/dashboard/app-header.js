import { html } from "@inglorious/web"

import { button } from "../../controls/button"
import { avatar } from "../../data-display/avatar"
import { divider } from "../../data-display/divider"
import { materialIcon } from "../../data-display/material-icon"
import { breadcrumbs } from "../../navigation/breadcrumbs"
import { appBar } from "../../surfaces/app-bar"

export const appHeader = {
  render(entity, api) {
    return html`
      <div class="iw-dashboard-header">
        ${appBar.render({
          position: "static",
          elevated: false,
          children: html`
            <div class="iw-dashboard-header-row">
              ${button.render({
                color: "secondary",
                variant: "ghost",
                shape: "square",
                children: materialIcon.render({ name: "menu", size: "lg" }),
                onClick: () => api.notify(`#appDrawer:toggle`),
              })}
              <div class="iw-dashboard-header-nav">
                ${button.render({
                  color: "secondary",
                  variant: "ghost",
                  children: "Dashboard",
                })}
                ${button.render({
                  color: "secondary",
                  variant: "ghost",
                  children: "Users",
                })}
                ${button.render({
                  color: "secondary",
                  variant: "ghost",
                  children: "Settings",
                })}
              </div>
              <div class="iw-dashboard-header-actions">
                ${button.render({
                  color: "secondary",
                  variant: "ghost",
                  shape: "square",
                  children: materialIcon.render({
                    name: "notifications",
                    size: "lg",
                  }),
                })}
                ${button.render({
                  color: "secondary",
                  variant: "ghost",
                  shape: "square",
                  children: materialIcon.render({
                    name: "format_list_bulleted",
                  }),
                })}
                ${button.render({
                  color: "secondary",
                  variant: "ghost",
                  shape: "square",
                  children: materialIcon.render({ name: "mail", size: "lg" }),
                })}
                ${divider.render({ orientation: "vertical" })}
                ${button.render({
                  color: "secondary",
                  variant: "ghost",
                  shape: "square",
                  children: materialIcon.render({
                    name: "contrast",
                    size: "lg",
                  }),
                })}
                ${divider.render({ orientation: "vertical" })}
                ${avatar.render({ src: "/antony.jpeg" })}
              </div>
            </div>
          `,
        })}
        <div class="iw-dashboard-header-row iw-dashboard-breadcrumbs">
          ${breadcrumbs.render({
            items: [{ label: "Home", href: "#" }, { label: "Dashboard" }],
          })}
        </div>
      </div>
    `
  },
}

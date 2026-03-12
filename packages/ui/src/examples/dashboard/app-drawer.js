import { html } from "@inglorious/web"

import { avatar } from "../../data-display/avatar"
import { badge } from "../../data-display/badge"
import { list } from "../../data-display/list"
import { materialIcon } from "../../data-display/material-icon"
import { drawer } from "../../navigation/drawer"

export const appDrawer = {
  toggle(entity) {
    entity.isOpen = !entity.isOpen
    entity.isHidden = !entity.isHidden
  },

  collapseToggle(entity) {
    entity.isCollapsed = !entity.isCollapsed
  },

  render(entity, api) {
    return drawer.render({
      ...entity,
      anchor: "left",
      onClose: () => api.notify(`#${entity.id}:toggle`),
      onCollapseToggle: () => api.notify(`#${entity.id}:collapseToggle`),
      title: html`<div class="iw-dashboard-brand">
        ${avatar.render({ src: "/transparent.png", shape: "square" })}
        <span class="iw-dashboard-brand-title">Inglorious UI</span>
      </div>`,
      children: html`
        ${list.render({
          isInset: true,
          padding: "sm",
          items: [
            {
              primary: "Dashboard",
              icon: materialIcon.render({ name: "speed", size: "lg" }),
              isSelected: true,
              action: badge.render({
                color: "info",
                children: "NEW",
                size: "sm",
              }),
            },
            { title: "Theme" },
            {
              primary: "Colors",
              icon: materialIcon.render({ name: "palette", size: "lg" }),
            },
            {
              primary: "Typography",
              icon: materialIcon.render({
                name: "text_fields",
                size: "lg",
              }),
            },
            { title: "Components" },
            {
              primary: "Base",
              icon: materialIcon.render({ name: "extension", size: "lg" }),
              isExpanded: true,
              children: [
                { primary: "Accordion" },
                { primary: "Cards" },
                { primary: "Pagination" },
                { primary: "Tables" },
              ],
            },
            {
              primary: "Buttons",
              icon: materialIcon.render({ name: "ads_click", size: "lg" }),
              children: [{ primary: "Buttons" }, { primary: "Button Group" }],
            },
            {
              primary: "Charts",
              icon: materialIcon.render({ name: "pie_chart", size: "lg" }),
            },
            {
              primary: "Forms",
              icon: materialIcon.render({ name: "fact_check", size: "lg" }),
              children: [
                { primary: "Checks and radios" },
                { primary: "Select" },
              ],
            },
          ],
        })}
      `,
    })
  },
}

import { html } from "@inglorious/web"

import { avatar } from "../../data-display/avatar"
import { badge } from "../../data-display/badge"
import { list } from "../../data-display/list"
import { materialIcon } from "../../data-display/material-icon"
import { flex } from "../../layout/flex"
import { drawer } from "../../navigation/drawer"

export const appDrawer = {
  create(entity) {
    entity.items ??= getDefaultItems()
  },

  toggle(entity) {
    entity.isOpen = !entity.isOpen
    entity.isHidden = !entity.isHidden
  },

  collapseToggle(entity) {
    entity.isCollapsed = !entity.isCollapsed
  },

  itemToggle(entity, payload) {
    if (!payload?.path?.length) return
    entity.items = toggleItemByPath(
      entity.items ?? getDefaultItems(),
      payload.path,
    )
  },

  render(entity, api) {
    return drawer.render({
      ...entity,
      anchor: "left",
      onClose: () => api.notify(`#${entity.id}:toggle`),
      onCollapseToggle: () => api.notify(`#${entity.id}:collapseToggle`),
      title: flex.render({
        align: "center",
        gap: "sm",
        padding: "md",
        className: "iw-dashboard-brand",
        children: [
          avatar.render({ src: "/transparent.png", shape: "square" }),
          html`<span class="iw-dashboard-brand-title">Inglorious UI</span>`,
        ],
      }),
      children: html`
        ${list.render({
          isInset: true,
          padding: "sm",
          items: entity.items,
          onItemToggle: (_, path) =>
            api.notify(`#${entity.id}:itemToggle`, { path }),
        })}
      `,
    })
  },
}

function getDefaultItems() {
  return [
    {
      id: "dashboard",
      primary: "Dashboard",
      icon: materialIcon.render({ name: "speed", size: "lg" }),
      isSelected: true,
      action: badge.render({
        color: "info",
        children: "NEW",
        size: "sm",
      }),
    },
    { id: "theme-title", title: "Theme" },
    {
      id: "colors",
      primary: "Colors",
      icon: materialIcon.render({ name: "palette", size: "lg" }),
    },
    {
      id: "typography",
      primary: "Typography",
      icon: materialIcon.render({ name: "text_fields", size: "lg" }),
    },
    { id: "components-title", title: "Components" },
    {
      id: "base",
      primary: "Base",
      icon: materialIcon.render({ name: "extension", size: "lg" }),
      isExpanded: false,
      children: [
        { id: "accordion", primary: "Accordion" },
        { id: "cards", primary: "Cards" },
        { id: "pagination", primary: "Pagination" },
        { id: "tables", primary: "Tables" },
      ],
    },
    {
      id: "buttons",
      primary: "Buttons",
      icon: materialIcon.render({ name: "ads_click", size: "lg" }),
      children: [
        { id: "buttons-main", primary: "Buttons" },
        { id: "button-group", primary: "Button Group" },
      ],
    },
    {
      id: "charts",
      primary: "Charts",
      icon: materialIcon.render({ name: "pie_chart", size: "lg" }),
    },
    {
      id: "forms",
      primary: "Forms",
      icon: materialIcon.render({ name: "fact_check", size: "lg" }),
      children: [
        { id: "checks", primary: "Checks and radios" },
        { id: "select", primary: "Select" },
      ],
    },
  ]
}

function toggleItemByPath(items, path) {
  if (!Array.isArray(items) || path.length === 0) return items

  const [index, ...rest] = path
  return items.map((item, itemIndex) => {
    if (itemIndex !== index || !item || typeof item !== "object") return item

    if (rest.length === 0) {
      const isExpanded = !!item.isExpanded
      return { ...item, isExpanded: !isExpanded }
    }

    const children = Array.isArray(item.children)
      ? toggleItemByPath(item.children, rest)
      : item.children

    return { ...item, children }
  })
}

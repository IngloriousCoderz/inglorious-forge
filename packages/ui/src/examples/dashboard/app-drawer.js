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
    const items = mapItemsForRender(entity.items ?? [])

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
          items,
          onItemToggle: (_, path) =>
            api.notify(`#${entity.id}:itemToggle`, { path }),
        })}
      `,
    })
  },
}

function mapItemsForRender(items) {
  return items.map((item) => {
    const mappedItem = { ...item }

    if (item.icon) {
      mappedItem.icon = materialIcon.render({ name: item.icon, size: "lg" })
    }

    if (item.badge) {
      mappedItem.action = badge.render(item.badge)
    }

    if (Array.isArray(item.children)) {
      mappedItem.children = mapItemsForRender(item.children)
    }

    return mappedItem
  })
}

function getDefaultItems() {
  return [
    {
      id: "dashboard",
      primary: "Dashboard",
      icon: "speed",
      isSelected: true,
      badge: {
        color: "info",
        children: "NEW",
        size: "sm",
      },
    },
    { id: "primitives-title", title: "Primitives" },
    {
      id: "layout",
      primary: "Layout",
      icon: "grid_view",
      children: [
        { id: "container", primary: "Container" },
        { id: "flex", primary: "Flex" },
        { id: "grid", primary: "Grid" },
      ],
    },
    {
      id: "controls",
      primary: "Controls",
      icon: "buttons_alt",
      children: [
        { id: "button", primary: "Button" },
        { id: "button-group", primary: "Button Group" },
        { id: "checkbox", primary: "Checkbox" },
        { id: "fab", primary: "Fab" },
        { id: "icon-button", primary: "Icon Button" },
        { id: "input", primary: "Input" },
        { id: "radio-group", primary: "Radio Group" },
        { id: "rating", primary: "Rating" },
        { id: "select", primary: "Select" },
        { id: "slider", primary: "Slider" },
        { id: "switch", primary: "Switch" },
      ],
    },
    {
      id: "data-display",
      primary: "Data Display",
      icon: "database",
      children: [
        { id: "avatar", primary: "Avatar" },
        { id: "badge", primary: "Badge" },
        { id: "chip", primary: "Chip" },
        { id: "data-grid", primary: "Data Grid" },
        { id: "divider", primary: "Divider" },
        { id: "icon", primary: "Icon" },
        { id: "list", primary: "List" },
        { id: "material-icon", primary: "Material Icon" },
        { id: "table", primary: "Table" },
        { id: "tooltip", primary: "Tooltip" },
        { id: "typography", primary: "Typography" },
      ],
    },
    {
      id: "feedback",
      primary: "Feedback",
      icon: "notifications",
      children: [
        { id: "alert", primary: "Alert" },
        { id: "backdrop", primary: "Backdrop" },
        { id: "dialog", primary: "Dialog" },
        { id: "progress", primary: "Progress" },
        { id: "skeleton", primary: "Skeleton" },
        { id: "snackbar", primary: "Snackbar" },
      ],
    },
    {
      id: "navigation",
      primary: "Navigation",
      icon: "explore",
      children: [
        { id: "bottom-navigation", primary: "Bottom Navigation" },
        { id: "breadcrumbs", primary: "Breadcrumbs" },
        { id: "drawer", primary: "Drawer" },
        { id: "link", primary: "Link" },
        { id: "menu", primary: "Menu" },
        { id: "pagination", primary: "Pagination" },
        { id: "speed-dial", primary: "Speed Dial" },
        { id: "stepper", primary: "Stepper" },
        { id: "tabs", primary: "Tabs" },
      ],
    },
    {
      id: "surfaces",
      primary: "Surfaces",
      icon: "layers",
      children: [
        { id: "accordion", primary: "Accordion" },
        { id: "app-bar", primary: "App Bar" },
        { id: "card", primary: "Card" },
        { id: "paper", primary: "Paper" },
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

import { html } from "@inglorious/web"

import { Avatar } from "../../data-display/avatar"
import { Badge } from "../../data-display/badge"
import { List } from "../../data-display/list"
import { MaterialIcon } from "../../data-display/material-icon"
import { Flex } from "../../layout/flex"
import { Drawer } from "../../navigation/drawer"

export const AppDrawer = {
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
    const items = mapItemsForRender(entity.items ?? [], api)

    return Drawer.render({
      ...entity,
      anchor: "left",
      onClose: () => api.notify(`#${entity.id}:toggle`),
      onCollapseToggle: () => api.notify(`#${entity.id}:collapseToggle`),
      title: Flex.render({
        align: "center",
        gap: "sm",
        padding: "md",
        className: "iw-dashboard-brand",
        children: [
          Avatar.render({ src: "/transparent.png", shape: "square" }),
          html`<span class="iw-dashboard-brand-title">Inglorious UI</span>`,
        ],
      }),
      children: html`
        ${List.render({
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

function mapItemsForRender(items, api) {
  const router = api.getEntity("router")

  return items.map((item) => {
    const mappedItem = { ...item }

    if (item.icon) {
      mappedItem.icon = MaterialIcon.render({ name: item.icon, size: "lg" })
    }

    if (item.badge) {
      mappedItem.action = Badge.render(item.badge)
    }

    if (item.href) {
      mappedItem.onClick = () => api.notify("#router:navigate", item.href)
    }

    if (router?.path === item.href) {
      mappedItem.isSelected = true
    }

    if (Array.isArray(item.children)) {
      mappedItem.children = mapItemsForRender(item.children, api)
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
      href: "/",
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
        { id: "container", primary: "Container", href: "/layout/container" },
        { id: "flex", primary: "Flex", href: "/layout/flex" },
        { id: "grid", primary: "Grid", href: "/layout/grid" },
      ],
    },
    {
      id: "controls",
      primary: "Controls",
      icon: "buttons_alt",
      children: [
        { id: "button", primary: "Button", href: "/controls/button" },
        {
          id: "button-group",
          primary: "Button Group",
          href: "/controls/button-group",
        },
        { id: "checkbox", primary: "Checkbox", href: "/controls/checkbox" },
        { id: "combobox", primary: "Combobox", href: "/controls/combobox" },
        { id: "fab", primary: "Fab", href: "/controls/fab" },
        {
          id: "icon-button",
          primary: "Icon Button",
          href: "/controls/icon-button",
        },
        { id: "input", primary: "Input", href: "/controls/input" },
        {
          id: "radio-group",
          primary: "Radio Group",
          href: "/controls/radio-group",
        },
        { id: "rating", primary: "Rating", href: "/controls/rating" },
        { id: "select", primary: "Select", href: "/controls/select" },
        { id: "slider", primary: "Slider", href: "/controls/slider" },
        { id: "switch", primary: "Switch", href: "/controls/switch" },
      ],
    },
    {
      id: "data-display",
      primary: "Data Display",
      icon: "database",
      children: [
        { id: "avatar", primary: "Avatar", href: "/data-display/avatar" },
        { id: "badge", primary: "Badge", href: "/data-display/badge" },
        { id: "chip", primary: "Chip", href: "/data-display/chip" },
        {
          id: "data-grid",
          primary: "Data Grid",
          href: "/data-display/data-grid",
        },
        { id: "divider", primary: "Divider", href: "/data-display/divider" },
        { id: "icon", primary: "Icon", href: "/data-display/icon" },
        { id: "list", primary: "List", href: "/data-display/list" },
        {
          id: "material-icon",
          primary: "Material Icon",
          href: "/data-display/material-icon",
        },
        { id: "table", primary: "Table", href: "/data-display/table" },
        { id: "tooltip", primary: "Tooltip", href: "/data-display/tooltip" },
        {
          id: "typography",
          primary: "Typography",
          href: "/data-display/typography",
        },
      ],
    },
    {
      id: "feedback",
      primary: "Feedback",
      icon: "notifications",
      children: [
        { id: "alert", primary: "Alert", href: "/feedback/alert" },
        { id: "backdrop", primary: "Backdrop", href: "/feedback/backdrop" },
        { id: "dialog", primary: "Dialog", href: "/feedback/dialog" },
        { id: "progress", primary: "Progress", href: "/feedback/progress" },
        { id: "skeleton", primary: "Skeleton", href: "/feedback/skeleton" },
        { id: "snackbar", primary: "Snackbar", href: "/feedback/snackbar" },
      ],
    },
    {
      id: "navigation",
      primary: "Navigation",
      icon: "explore",
      children: [
        {
          id: "bottom-navigation",
          primary: "Bottom Navigation",
          href: "/navigation/bottom-navigation",
        },
        {
          id: "breadcrumbs",
          primary: "Breadcrumbs",
          href: "/navigation/breadcrumbs",
        },
        { id: "drawer", primary: "Drawer", href: "/navigation/drawer" },
        { id: "link", primary: "Link", href: "/navigation/link" },
        { id: "menu", primary: "Menu", href: "/navigation/menu" },
        {
          id: "pagination",
          primary: "Pagination",
          href: "/navigation/pagination",
        },
        {
          id: "speed-dial",
          primary: "Speed Dial",
          href: "/navigation/speed-dial",
        },
        { id: "stepper", primary: "Stepper", href: "/navigation/stepper" },
        { id: "tabs", primary: "Tabs", href: "/navigation/tabs" },
      ],
    },
    {
      id: "surfaces",
      primary: "Surfaces",
      icon: "layers",
      children: [
        { id: "accordion", primary: "Accordion", href: "/surfaces/accordion" },
        { id: "app-bar", primary: "App Bar", href: "/surfaces/app-bar" },
        { id: "card", primary: "Card", href: "/surfaces/card" },
        { id: "paper", primary: "Paper", href: "/surfaces/paper" },
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

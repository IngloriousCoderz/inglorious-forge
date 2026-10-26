import { createRender } from "../../stories/notify-story.js"
import { Menu } from "."

export default {
  title: "Navigation/Menu",
  tags: ["autodocs"],
  render: createRender(Menu),
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Whether the menu is visible.",
    },
    items: { control: "object", description: "Menu items and separators." },
    isDense: { control: "boolean", description: "Compact item spacing." },
    trigger: {
      control: "text",
      description: "Content of a button that opens the menu as a popover.",
    },
    onToggle: { action: "onToggle" },
    onItemClick: { action: "onItemClick" },
  },
  parameters: {
    docs: {
      description: {
        component: "Floating action list with overridable `renderItem`.",
      },
    },
  },
}

export const Default = {
  args: {
    isOpen: true,
    items: [
      { label: "Profile", icon: "👤" },
      { label: "Settings", icon: "⚙" },
      { hasDivider: true },
      { label: "Logout", trailing: "⌘Q" },
    ],
  },
}

// Anchored to its trigger. Without onToggle wired to a store, the browser
// keeps the open state on its own.
export const WithTrigger = {
  args: {
    id: "story-menu",
    trigger: "Actions",
    items: Default.args.items,
  },
}

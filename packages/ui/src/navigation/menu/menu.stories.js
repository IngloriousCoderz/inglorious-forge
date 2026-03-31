import { createRender } from "../../stories/notifyStory.js"
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

import { createRender } from "../../stories/notifyStory.js"
import { menu } from "."

export default {
  title: "Navigation/Menu",
  tags: ["autodocs"],
  render: createRender(menu),
  argTypes: {
    open: { control: "boolean", description: "Whether the menu is visible." },
    items: { control: "object", description: "Menu items and separators." },
    dense: { control: "boolean", description: "Compact item spacing." },
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
    open: true,
    items: [
      { label: "Profile", icon: "👤" },
      { label: "Settings", icon: "⚙" },
      { divider: true },
      { label: "Logout", trailing: "⌘Q" },
    ],
  },
}

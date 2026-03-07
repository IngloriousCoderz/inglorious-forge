import { createRender } from "../../stories/notifyStory.js"
import { bottomNavigation } from "."

export default {
  title: "Navigation/Bottom Navigation",
  tags: ["autodocs"],
  render: createRender(bottomNavigation),
  argTypes: {
    actions: { control: "object", description: "Bottom navigation actions." },
    value: { control: "text", description: "Currently selected action value." },
    showLabels: { control: "boolean", description: "Show labels below icons." },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Bottom bar action navigation with overridable `renderAction`.",
      },
    },
  },
}

export const Default = {
  args: {
    value: "recents",
    actions: [
      { value: "recents", label: "Recents", icon: "🕘" },
      { value: "favorites", label: "Favorites", icon: "★" },
      { value: "nearby", label: "Nearby", icon: "📍" },
    ],
  },
}

import { createRender } from "../../stories/notifyStory.js"
import { tabs } from "."

export default {
  title: "Navigation/Tabs",
  tags: ["autodocs"],
  render: createRender(tabs),
  argTypes: {
    items: {
      control: "object",
      description: "Tab labels, values, and optional panels.",
    },
    value: { control: "text", description: "Currently selected tab value." },
    isCentered: { control: "boolean", description: "Center the tab list." },
    isFullWidth: {
      control: "boolean",
      description: "Stretch tabs to fill available width.",
    },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Section navigation with overridable `renderTab` and `renderPanel` methods.",
      },
    },
  },
}

export const Default = {
  args: {
    value: "overview",
    items: [
      { value: "overview", label: "Overview", panel: "Overview content" },
      { value: "activity", label: "Activity", panel: "Activity content" },
      { value: "settings", label: "Settings", panel: "Settings content" },
    ],
  },
}

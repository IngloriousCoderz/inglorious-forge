import { makeStoryRender } from "../../stories/notifyStory.js"
import { materialIcon } from "."

export default {
  title: "Data Display/MaterialIcon",
  tags: ["autodocs"],
  render: makeStoryRender({ materialIcon }),
  argTypes: {
    name: {
      control: "text",
      description: "Material Symbol name (for example `home`, `settings`).",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Icon size scale.",
    },
    filled: {
      control: "boolean",
      description: "Toggles filled font variation.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Material Symbols wrapper that renders icons by name using text ligatures.",
      },
    },
  },
}

export const Default = {
  args: {
    id: "materialIcon",
    type: "materialIcon",
    name: "home",
    size: "md",
    filled: true,
  },
}

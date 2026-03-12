import { createRender } from "../../stories/notifyStory.js"
import { materialIcon } from "."

export default {
  title: "Data Display/MaterialIcon",
  tags: ["autodocs"],
  render: createRender(materialIcon),
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
    isFilled: {
      control: "boolean",
      description: "Toggles filled font variation.",
    },
    onClick: { action: "onClick" },
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
    name: "home",
    size: "md",
    isFilled: true,
  },
}

import { createRender } from "../../stories/notifyStory.js"
import { chip } from "."

export default {
  title: "Data Display/Chip",
  tags: ["autodocs"],
  render: createRender(chip),
  argTypes: {
    children: { control: "text", description: "Chip label content." },
    isRemovable: {
      control: "boolean",
      description: "Shows a remove affordance and emits `#id:remove`.",
    },
    color: {
      control: "select",
      options: [
        "default",
        "primary",
        "secondary",
        "success",
        "warning",
        "error",
        "info",
      ],
      description: "Semantic color variant.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Chip size scale.",
    },
    shape: {
      control: "select",
      options: ["pill", "rounded", "square"],
      description: "Chip corner style.",
    },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Small labeled token for selections and filters, optionally removable.",
      },
    },
  },
}

export const Default = {
  args: {
    children: "Tag",
    isRemovable: true,
    color: "default",
    size: "md",
    shape: "pill",
  },
}

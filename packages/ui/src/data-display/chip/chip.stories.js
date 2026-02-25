import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { chip } from "."

export default {
  title: "Data Display/Chip",
  tags: ["autodocs"],
  render: makeStoryRender(chip, "story-chip"),
  argTypes: {
    ...notifyActionArgType,
    children: { control: "text", description: "Chip label content." },
    removable: {
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
    removable: true,
    color: "default",
    size: "md",
    shape: "pill",
  },
}

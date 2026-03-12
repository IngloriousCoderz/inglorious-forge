import { createRender } from "../../stories/notifyStory.js"
import { badge } from "."

export default {
  title: "Data Display/Badge",
  tags: ["autodocs"],
  render: createRender(badge),
  argTypes: {
    children: { control: "text", description: "Badge content." },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic color intent.",
    },
    variant: {
      control: "select",
      options: ["solid", "outline"],
      description: "Visual style variant.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Badge size scale.",
    },
    shape: {
      control: "select",
      options: ["rectangle", "pill", "circle", "square"],
      description: "Badge shape variant.",
    },
    ringWidth: {
      control: "text",
      description: "Ring width for shaped badges (e.g. 2px).",
    },
    className: {
      control: "text",
      description: "Additional CSS classes.",
    },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Compact status label for counters, tags, and semantic highlights.",
      },
    },
  },
}

export const Default = {
  args: {
    children: "New",
    size: "md",
  },
}

export const Dot = {
  args: {
    children: "",
    color: "success",
    shape: "circle",
    ringWidth: "2px",
  },
}

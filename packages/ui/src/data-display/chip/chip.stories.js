import sell from "@iconify-icons/material-symbols/sell"

import { createRender } from "../../stories/notify-story.js"
import { Icon } from "../icon"
import { Chip } from "."

export default {
  title: "Data Display/Chip",
  tags: ["autodocs"],
  render: createRender(Chip),
  argTypes: {
    children: { control: "text", description: "Chip label content." },
    isSelected: {
      control: "boolean",
      description: "Makes the chip a toggle button, pressed while true.",
    },
    icon: {
      control: false,
      description: "Shown before the label, such as an `Icon.render(...)`.",
    },
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

export const WithIcon = {
  args: {
    ...Default.args,
    children: "Paid",
    icon: Icon.render({ icon: sell, size: "sm" }),
    isRemovable: false,
    color: "success",
  },
}

export const Selectable = {
  args: {
    ...Default.args,
    children: "Vegan",
    isRemovable: false,
    isSelected: true,
  },
}

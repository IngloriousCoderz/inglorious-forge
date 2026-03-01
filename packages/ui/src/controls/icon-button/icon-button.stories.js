import { createRender } from "../../stories/notifyStory.js"
import { iconButton } from "."

export default {
  title: "Controls/IconButton",
  tags: ["autodocs"],
  render: createRender(iconButton),
  argTypes: {
    icon: { control: "text", description: "Leading icon content." },
    label: { control: "text", description: "Optional button label." },
    iconAfter: { control: "text", description: "Trailing icon content." },
    direction: {
      control: "select",
      options: ["row", "column"],
      description: "Layout direction for icon and label.",
    },
    ariaLabel: {
      control: "text",
      description: "Accessible name when used as icon-only button.",
    },
    variant: {
      control: "select",
      options: ["default", "outline", "ghost"],
      description: "Visual style variant inherited from button.",
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic color inherited from button.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size scale for paddings and font-size.",
    },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Wrapper around button for icon-oriented content and compact icon-only actions.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  icon: "★",
  label: "Favorite",
  iconAfter: "",
  direction: "row",
  iconOnly: false,
  ariaLabel: "Favorite",
  variant: "default",
  color: "primary",
}

export const IconOnly = {}
IconOnly.args = {
  ...Default.args,
  icon: "⚙",
  label: "",
  iconOnly: true,
  variant: "ghost",
  ariaLabel: "Settings",
}

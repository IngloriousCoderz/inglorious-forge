import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { button } from "."

export default {
  title: "Controls/Button",
  tags: ["autodocs"],
  render: makeStoryRender(button, "story-button"),
  argTypes: {
    ...notifyActionArgType,
    label: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "outline", "ghost"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    type: {
      control: "select",
      options: ["button", "submit", "reset", "menu"],
    },
  },
  parameters: {
    actions: {
      handles: ["click"],
    },
  },
}
export const Default = {}
Default.args = {
  label: "Button",
  variant: "default",
  color: "primary",
  size: "md",
  disabled: false,
  fullWidth: false,
  type: "button",
}

export const Outline = {}
Outline.args = {
  ...Default.args,
  variant: "outline",
}

export const Ghost = {}
Ghost.args = {
  ...Default.args,
  variant: "ghost",
}

export const Small = {}
Small.args = {
  ...Default.args,
  size: "sm",
}

export const Large = {}
Large.args = {
  ...Default.args,
  size: "lg",
}

export const Secondary = {}
Secondary.args = {
  ...Default.args,
  color: "secondary",
}

export const Success = {}
Success.args = {
  ...Default.args,
  color: "success",
}

export const Disabled = {}
Disabled.args = {
  ...Default.args,
  disabled: true,
}

export const FullWidth = {}
FullWidth.args = {
  ...Default.args,
  label: "Full Width Button",
  fullWidth: true,
}

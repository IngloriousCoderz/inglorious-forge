import { html } from "@inglorious/web"

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
    children: {
      control: "text",
      description: "Content displayed inside the button.",
    },
    variant: {
      control: "select",
      options: ["default", "outline", "ghost"],
      description: "Visual style variant.",
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic color intent.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size scale for paddings and font-size.",
    },
    shape: {
      control: "select",
      options: ["rectangle", "pill", "round", "square"],
      description: "Button shape profile.",
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and click notifications.",
    },
    fullWidth: {
      control: "boolean",
      description: "Expands button width to 100% of its container.",
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset", "menu"],
      description: "Native HTML button type attribute.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Action control with theme-aware variants, sizes, and semantic colors.",
      },
    },
    actions: {
      handles: ["click"],
    },
  },
}
export const Default = {}
Default.args = {
  children: "Button",
  variant: "default",
  color: "primary",
  size: "md",
  shape: "rectangle",
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
  children: "Full Width Button",
  fullWidth: true,
}

export const Round = {}
Round.args = {
  ...Default.args,
  shape: "round",
  children: "＋",
}

export const CustomContent = {}
CustomContent.args = {
  ...Default.args,
  children: html`<span style="display: inline-flex; gap: 0.25rem;"
    ><strong>Save</strong><span>⌘S</span></span
  >`,
}

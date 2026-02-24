import { createMockApi, render } from "@inglorious/web/test"

import { button } from "."

export default {
  title: "Controls/Button",
  tags: ["autodocs"],
  argTypes: {
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

const Template = (args) => {
  const container = document.createElement("div")
  const entity = { id: "story-button", ...args }
  const api = createMockApi(entity)
  render(button.render(entity, api), container)
  return container
}

export const Default = Template.bind({})
Default.args = {
  label: "Button",
  variant: "default",
  color: "primary",
  size: "md",
  disabled: false,
  fullWidth: false,
  type: "button",
}

export const Outline = Template.bind({})
Outline.args = {
  ...Default.args,
  variant: "outline",
}

export const Ghost = Template.bind({})
Ghost.args = {
  ...Default.args,
  variant: "ghost",
}

export const Small = Template.bind({})
Small.args = {
  ...Default.args,
  size: "sm",
}

export const Large = Template.bind({})
Large.args = {
  ...Default.args,
  size: "lg",
}

export const Secondary = Template.bind({})
Secondary.args = {
  ...Default.args,
  color: "secondary",
}

export const Success = Template.bind({})
Success.args = {
  ...Default.args,
  color: "success",
}

export const Disabled = Template.bind({})
Disabled.args = {
  ...Default.args,
  disabled: true,
}

export const FullWidth = Template.bind({})
FullWidth.args = {
  ...Default.args,
  label: "Full Width Button",
  fullWidth: true,
}

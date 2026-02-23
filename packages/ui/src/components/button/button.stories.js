import { createMockApi, render } from "@inglorious/web/test"

import { button } from "."

export default {
  title: "Components/Button",
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

export const Sizes = () => {
  const container = document.createElement("div")
  container.style.display = "flex"
  container.style.gap = "1rem"
  container.style.alignItems = "center"

  const sizes = ["sm", "md", "lg"]
  sizes.forEach((size) => {
    const entity = { id: `btn-${size}`, label: size.toUpperCase(), size }
    const api = createMockApi(entity)
    render(button.render(entity, api), container)
  })

  return container
}

export const Colors = () => {
  const container = document.createElement("div")
  container.style.display = "flex"
  container.style.gap = "1rem"
  container.style.flexWrap = "wrap"

  const colors = ["primary", "secondary", "success", "warning", "error", "info"]
  colors.forEach((color) => {
    const entity = { id: `btn-${color}`, label: color, color }
    const api = createMockApi(entity)
    render(button.render(entity, api), container)
  })

  return container
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

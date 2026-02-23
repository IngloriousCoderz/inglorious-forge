import { createMockApi, render } from "@inglorious/web/test"

import { input } from "."

export default {
  title: "Components/Input",
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    name: { control: "text" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
    },
    value: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    required: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
}

const Template = (args) => {
  const container = document.createElement("div")
  const entity = { id: "story-input", ...args }
  const api = createMockApi(entity)
  render(input.render(entity, api), container)
  return container
}

export const Default = Template.bind({})
Default.args = {
  label: "Username",
  placeholder: "Enter your username",
  name: "username",
  type: "text",
  value: "",
  hint: "",
  error: "",
  size: "md",
  disabled: false,
  readonly: false,
  required: false,
  fullWidth: false,
}

export const WithHint = Template.bind({})
WithHint.args = {
  ...Default.args,
  label: "Email",
  type: "email",
  placeholder: "you@example.com",
  hint: "We'll never share your email",
}

export const WithError = Template.bind({})
WithError.args = {
  ...Default.args,
  label: "Email",
  type: "email",
  value: "invalid-email",
  error: "Please enter a valid email address",
}

export const Required = Template.bind({})
Required.args = {
  ...Default.args,
  label: "Password",
  type: "password",
  placeholder: "Enter your password",
  required: true,
}

export const Disabled = Template.bind({})
Disabled.args = {
  ...Default.args,
  label: "Disabled Input",
  disabled: true,
  value: "Cannot edit",
}

export const Readonly = Template.bind({})
Readonly.args = {
  ...Default.args,
  label: "Readonly Input",
  readonly: true,
  value: "Read-only value",
}

export const Sizes = () => {
  const container = document.createElement("div")
  container.style.display = "flex"
  container.style.flexDirection = "column"
  container.style.gap = "1rem"

  const sizes = ["sm", "md", "lg"]
  sizes.forEach((size) => {
    const entity = {
      id: `input-${size}`,
      label: `Size: ${size}`,
      name: `input-${size}`,
      placeholder: `${size} input`,
      size,
    }
    const api = createMockApi(entity)
    render(input.render(entity, api), container)
  })

  return container
}

export const FullWidth = Template.bind({})
FullWidth.args = {
  ...Default.args,
  label: "Full Width Input",
  placeholder: "This input takes full width",
  fullWidth: true,
}

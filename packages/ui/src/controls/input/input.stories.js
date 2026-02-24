import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { input } from "."

export default {
  title: "Controls/Input",
  tags: ["autodocs"],
  render: makeStoryRender(input, "story-input"),
  argTypes: {
    ...notifyActionArgType,
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
export const Default = {}
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

export const WithHint = {}
WithHint.args = {
  ...Default.args,
  label: "Email",
  type: "email",
  placeholder: "you@example.com",
  hint: "We'll never share your email",
}

export const WithError = {}
WithError.args = {
  ...Default.args,
  label: "Email",
  type: "email",
  value: "invalid-email",
  error: "Please enter a valid email address",
}

export const Required = {}
Required.args = {
  ...Default.args,
  label: "Password",
  type: "password",
  placeholder: "Enter your password",
  required: true,
}

export const Disabled = {}
Disabled.args = {
  ...Default.args,
  label: "Disabled Input",
  disabled: true,
  value: "Cannot edit",
}

export const Readonly = {}
Readonly.args = {
  ...Default.args,
  label: "Readonly Input",
  readonly: true,
  value: "Read-only value",
}

export const Small = {}
Small.args = {
  ...Default.args,
  label: "Small Input",
  size: "sm",
}

export const Large = {}
Large.args = {
  ...Default.args,
  label: "Large Input",
  size: "lg",
}

export const FullWidth = {}
FullWidth.args = {
  ...Default.args,
  label: "Full Width Input",
  placeholder: "This input takes full width",
  fullWidth: true,
}

import { createRender } from "../../stories/notifyStory.js"
import { input } from "."

export default {
  title: "Controls/Input",
  tags: ["autodocs"],
  render: createRender(input),
  argTypes: {
    // ...notifyActionArgType,
    label: {
      control: "text",
      description: "Field label rendered above the input.",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text shown when value is empty.",
    },
    name: {
      control: "text",
      description: "Native HTML input name attribute.",
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
      description: "Native HTML input type.",
    },
    inputmode: {
      control: "select",
      options: [
        "none",
        "text",
        "decimal",
        "numeric",
        "tel",
        "search",
        "email",
        "url",
      ],
      description: "Native inputmode hint for virtual keyboards.",
    },
    value: {
      control: "text",
      description: "Current input value.",
    },
    hint: {
      control: "text",
      description: "Helper text shown below the field when there is no error.",
    },
    error: {
      control: "text",
      description: "Validation message shown below the field.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size scale for paddings and font-size.",
    },
    disabled: {
      control: "boolean",
      description: "Disables user input and interaction.",
    },
    readonly: {
      control: "boolean",
      description: "Prevents editing while keeping the field focusable.",
    },
    required: {
      control: "boolean",
      description: "Marks the field as required.",
    },
    fullWidth: {
      control: "boolean",
      description: "Expands input width to 100% of its container.",
    },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Text field control with labels, hints, errors, and semantic states.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  label: "Username",
  placeholder: "Enter your username",
  name: "username",
  inputType: "text",
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
  inputType: "email",
  placeholder: "you@example.com",
  hint: "We'll never share your email",
}

export const WithError = {}
WithError.args = {
  ...Default.args,
  label: "Email",
  inputType: "email",
  value: "invalid-email",
  error: "Please enter a valid email address",
}

export const Required = {}
Required.args = {
  ...Default.args,
  label: "Password",
  inputType: "password",
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

export const Number = {}
Number.args = {
  ...Default.args,
  label: "Amount",
  inputType: "number",
  value: "1234.56",
  placeholder: "0.00",
  min: "0",
  max: "10000",
  step: "0.01",
  inputmode: "decimal",
  "data-testid": "amount-input",
}

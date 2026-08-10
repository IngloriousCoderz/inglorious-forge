import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { Input } from "."

const nativeInputTypes = [
  "text",
  "password",
  "email",
  "number",
  "tel",
  "url",
  "search",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
]

const nativeInputDefaults = {
  text: { label: "Text", value: "Hello world" },
  password: { label: "Password", value: "secret123" },
  email: { label: "Email", value: "you@example.com" },
  number: { label: "Number", value: "42" },
  tel: { label: "Phone", value: "+1 555 123 4567" },
  url: { label: "Website", value: "https://example.com" },
  search: { label: "Search", value: "inglorious" },
  date: { label: "Date", value: "2026-08-10" },
  time: { label: "Time", value: "09:30" },
  "datetime-local": { label: "Date and time", value: "2026-08-10T09:30" },
  month: { label: "Month", value: "2026-08" },
  week: { label: "Week", value: "2026-W32" },
  color: { label: "Color", value: "#7c3aed" },
}

export default {
  title: "Controls/Input",
  tags: ["autodocs"],
  render: createRender(Input),
  argTypes: {
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
    inputType: {
      control: "select",
      options: nativeInputTypes,
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
    isDisabled: {
      control: "boolean",
      description: "Disables user input and interaction.",
    },
    isReadOnly: {
      control: "boolean",
      description: "Prevents editing while keeping the field focusable.",
    },
    isRequired: {
      control: "boolean",
      description: "Marks the field as required.",
    },
    isFullWidth: {
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
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  isFullWidth: false,
}

export const ManagedNativeTypes = {
  render: (args) => html`
    <div style="display: grid; gap: 1rem; max-width: 40rem;">
      ${nativeInputTypes.map((inputType) =>
        Input.render({
          ...args,
          ...nativeInputDefaults[inputType],
          name: `${inputType}-field`,
          label: nativeInputDefaults[inputType].label,
          inputType,
          value: nativeInputDefaults[inputType].value,
        }),
      )}
    </div>
  `,
}

ManagedNativeTypes.args = {
  ...Default.args,
  label: "Managed native types",
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
  isRequired: true,
}

export const Disabled = {}
Disabled.args = {
  ...Default.args,
  label: "Disabled Input",
  isDisabled: true,
  value: "Cannot edit",
}

export const Readonly = {}
Readonly.args = {
  ...Default.args,
  label: "Readonly Input",
  isReadOnly: true,
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
  isFullWidth: true,
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

export const Date = {}
Date.args = {
  ...Default.args,
  label: "Date",
  inputType: "date",
  value: "2026-08-10",
  min: "2024-01-01",
  max: "2027-12-31",
}

export const Time = {}
Time.args = {
  ...Default.args,
  label: "Time",
  inputType: "time",
  value: "09:30",
  min: "08:00",
  max: "18:00",
}

export const DateTimeLocal = {}
DateTimeLocal.args = {
  ...Default.args,
  label: "Date and time",
  inputType: "datetime-local",
  value: "2026-08-10T09:30",
}

export const Month = {}
Month.args = {
  ...Default.args,
  label: "Month",
  inputType: "month",
  value: "2026-08",
}

export const Week = {}
Week.args = {
  ...Default.args,
  label: "Week",
  inputType: "week",
  value: "2026-W32",
}

export const Color = {}
Color.args = {
  ...Default.args,
  label: "Color",
  inputType: "color",
  value: "#7c3aed",
}

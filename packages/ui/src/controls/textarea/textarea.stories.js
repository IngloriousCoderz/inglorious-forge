import { createRender } from "../../stories/notifyStory.js"
import { Textarea } from "."

export default {
  title: "Controls/Textarea",
  tags: ["autodocs"],
  render: createRender(Textarea),
  argTypes: {
    label: {
      control: "text",
      description: "Field label rendered above the textarea.",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text shown when value is empty.",
    },
    name: {
      control: "text",
      description: "Native HTML textarea name attribute.",
    },
    value: {
      control: "text",
      description: "Current textarea value.",
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
      description: "Size scale for internal spacing and typography.",
    },
    rows: {
      control: "number",
      description: "Initial number of visible text rows.",
    },
    isDisabled: {
      control: "boolean",
      description: "Disables user input and interaction.",
    },
    isReadOnly: {
      control: "boolean",
      description: "Prevents editing while keeping the control focusable.",
    },
    isRequired: {
      control: "boolean",
      description: "Marks the field as required.",
    },
    isFullWidth: {
      control: "boolean",
      description: "Expands the textarea width to 100% of its container.",
    },
    isAutoSize: {
      control: "boolean",
      description:
        "Applies field-sizing: content so the textarea grows with its content.",
    },
    isResizable: {
      control: "boolean",
      description: "Enables the browser resize handle for vertical resizing.",
    },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Multi-line text input with labels, hints, errors, and automatic content sizing support.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  label: "Bio",
  placeholder: "Tell us a little about yourself",
  name: "bio",
  value: "",
  hint: "",
  error: "",
  size: "md",
  rows: 4,
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  isFullWidth: false,
  isAutoSize: false,
  isResizable: false,
}

export const WithHint = {}
WithHint.args = {
  ...Default.args,
  label: "Project notes",
  hint: "Include any implementation details or blockers.",
}

export const WithError = {}
WithError.args = {
  ...Default.args,
  label: "Description",
  value: "This is too long",
  error: "Please keep the description under 280 characters.",
}

export const Required = {}
Required.args = {
  ...Default.args,
  label: "Message",
  placeholder: "Write a quick message",
  isRequired: true,
}

export const Disabled = {}
Disabled.args = {
  ...Default.args,
  label: "Disabled textarea",
  isDisabled: true,
  value: "Cannot edit this value",
}

export const Readonly = {}
Readonly.args = {
  ...Default.args,
  label: "Read-only textarea",
  isReadOnly: true,
  value: "This field is read-only and not editable.",
}

export const Small = {}
Small.args = {
  ...Default.args,
  label: "Small textarea",
  size: "sm",
}

export const Large = {}
Large.args = {
  ...Default.args,
  label: "Large textarea",
  size: "lg",
}

export const FullWidth = {}
FullWidth.args = {
  ...Default.args,
  label: "Full width textarea",
  placeholder: "This textarea takes the full width of its container",
  isFullWidth: true,
}

import { createRender } from "../../stories/notifyStory.js"
import { Checkbox } from "."

export default {
  title: "Controls/Checkbox",
  tags: ["autodocs"],
  render: createRender(Checkbox),
  argTypes: {
    label: { control: "text", description: "Label text." },
    name: { control: "text", description: "Native HTML name attribute." },
    isChecked: { control: "boolean", description: "Current checked state." },
    isDisabled: { control: "boolean", description: "Disables interaction." },
    isRequired: { control: "boolean", description: "Marks input as required." },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic accent color.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Label size scale.",
    },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component: "Boolean control with a native checkbox input.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  label: "Accept terms",
  name: "terms",
  isChecked: false,
  isDisabled: false,
  isRequired: false,
  color: "primary",
  size: "md",
}

export const Checked = {}
Checked.args = {
  ...Default.args,
  isChecked: true,
}

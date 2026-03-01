import { makeStoryRender } from "../../stories/notifyStory.js"
import { checkbox } from "."

export default {
  title: "Controls/Checkbox",
  tags: ["autodocs"],
  render: makeStoryRender(checkbox.render),
  argTypes: {
    label: { control: "text", description: "Label text." },
    name: { control: "text", description: "Native HTML name attribute." },
    checked: { control: "boolean", description: "Current checked state." },
    disabled: { control: "boolean", description: "Disables interaction." },
    required: { control: "boolean", description: "Marks input as required." },
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
  checked: false,
  disabled: false,
  required: false,
  color: "primary",
  size: "md",
}

export const Checked = {}
Checked.args = {
  ...Default.args,
  checked: true,
}

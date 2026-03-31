import { createRender } from "../../stories/notifyStory.js"
import { Switch } from "."

export default {
  title: "Controls/Switch",
  tags: ["autodocs"],
  render: createRender(Switch),
  argTypes: {
    label: { control: "text", description: "Label text." },
    name: { control: "text", description: "Native input name." },
    isChecked: { control: "boolean", description: "Current checked state." },
    isDisabled: { control: "boolean", description: "Disables interaction." },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic active-track color.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Switch size.",
    },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component: "Binary on/off control with a styled switch track.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  label: "Enable notifications",
  name: "notifications",
  isChecked: false,
  isDisabled: false,
  color: "primary",
  size: "md",
}

export const On = {}
On.args = {
  ...Default.args,
  isChecked: true,
}

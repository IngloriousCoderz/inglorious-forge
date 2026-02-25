import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { switchControl } from "."

export default {
  title: "Controls/Switch",
  tags: ["autodocs"],
  render: makeStoryRender({ switchControl }),
  argTypes: {
    ...notifyActionArgType,
    label: { control: "text", description: "Label text." },
    name: { control: "text", description: "Native input name." },
    checked: { control: "boolean", description: "Current checked state." },
    disabled: { control: "boolean", description: "Disables interaction." },
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
  id: "switchControl",
  type: "switchControl",
  label: "Enable notifications",
  name: "notifications",
  checked: false,
  disabled: false,
  color: "primary",
  size: "md",
}

export const On = {}
On.args = {
  ...Default.args,
  checked: true,
}

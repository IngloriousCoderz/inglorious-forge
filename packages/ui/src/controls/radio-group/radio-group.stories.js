import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { radioGroup } from "."

export default {
  title: "Controls/RadioGroup",
  tags: ["autodocs"],
  render: makeStoryRender({ radioGroup }),
  argTypes: {
    ...notifyActionArgType,
    label: { control: "text", description: "Fieldset label." },
    name: { control: "text", description: "Native radio input name." },
    value: { control: "text", description: "Selected option value." },
    direction: {
      control: "select",
      options: ["column", "row"],
      description: "Layout direction for options.",
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic accent color.",
    },
    disabled: { control: "boolean", description: "Disables all options." },
    options: { control: "object", description: "List of radio options." },
  },
  parameters: {
    docs: {
      description: {
        component: "Single-choice control rendered from an options array.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  id: "radioGroup",
  type: "radioGroup",
  label: "Priority",
  name: "priority",
  value: "medium",
  direction: "column",
  color: "primary",
  disabled: false,
  options: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ],
}

export const Row = {}
Row.args = {
  ...Default.args,
  direction: "row",
}

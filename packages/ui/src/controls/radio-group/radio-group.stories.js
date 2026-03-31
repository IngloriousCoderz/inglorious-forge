import { createRender } from "../../stories/notifyStory.js"
import { RadioGroup } from "."

export default {
  title: "Controls/RadioGroup",
  tags: ["autodocs"],
  render: createRender(RadioGroup),
  argTypes: {
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
    isDisabled: { control: "boolean", description: "Disables all options." },
    options: { control: "object", description: "List of radio options." },
    onChange: { action: "onChange" },
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
  label: "Priority",
  name: "priority",
  value: "medium",
  direction: "column",
  color: "primary",
  isDisabled: false,
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

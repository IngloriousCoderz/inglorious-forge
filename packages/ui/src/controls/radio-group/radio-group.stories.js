import { createRender } from "../../stories/notify-story.js"
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
    variant: {
      control: "select",
      options: ["default", "card"],
      description: "`card` draws each option as a card in a grid.",
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic accent color.",
    },
    isDisabled: { control: "boolean", description: "Disables all options." },
    options: {
      control: "object",
      description:
        "List of radio options: `label`, `value`, and an optional `description` under the label.",
    },
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

export const WithDescriptions = {}
WithDescriptions.args = {
  ...Default.args,
  label: "Shipping",
  name: "shipping",
  value: "standard",
  options: [
    {
      label: "Standard",
      value: "standard",
      description: "3 to 5 working days, free",
    },
    { label: "Express", value: "express", description: "Next day, €9" },
  ],
}

export const Cards = {}
Cards.args = {
  ...Default.args,
  label: "Room",
  name: "room",
  value: "double",
  variant: "card",
  options: [
    { label: "Single", value: "single", description: "One bed, €80" },
    { label: "Double", value: "double", description: "Two beds, €120" },
    { label: "Suite", value: "suite", description: "With a view, €200" },
  ],
}

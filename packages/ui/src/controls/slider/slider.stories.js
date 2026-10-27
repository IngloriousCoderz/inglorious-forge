import { createRender } from "../../stories/notify-story.js"
import { Slider } from "."

export default {
  title: "Controls/Slider",
  tags: ["autodocs"],
  render: createRender(Slider),
  argTypes: {
    label: { control: "text", description: "Field label." },
    name: { control: "text", description: "Native input name." },
    value: {
      control: "object",
      description:
        "One number, or `[low, high]` for a range with a thumb at each end.",
    },
    min: { control: "number", description: "Minimum value." },
    max: { control: "number", description: "Maximum value." },
    step: { control: "number", description: "Step value." },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic accent color.",
    },
    isDisabled: { control: "boolean", description: "Disables interaction." },
    isValueVisible: { control: "boolean", description: "Shows current value." },
    isFullWidth: { control: "boolean", description: "Expands width to 100%." },
    hasMarks: {
      control: "boolean",
      description: "Draws a tick at every step.",
    },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component: "Range input control with optional value indicator.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  label: "Volume",
  name: "volume",
  value: 30,
  min: 0,
  max: 100,
  step: 1,
  color: "primary",
  isDisabled: false,
  isValueVisible: true,
  isFullWidth: false,
}

export const Range = {}
Range.args = {
  ...Default.args,
  label: "Price",
  name: "price",
  value: [20, 80],
}

export const Marks = {}
Marks.args = {
  ...Default.args,
  label: "Rating",
  name: "rating",
  value: 3,
  min: 1,
  max: 5,
  hasMarks: true,
}

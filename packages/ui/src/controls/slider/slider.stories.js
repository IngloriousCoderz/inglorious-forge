import { makeStoryRender } from "../../stories/notifyStory.js"
import { slider } from "."

export default {
  title: "Controls/Slider",
  tags: ["autodocs"],
  render: makeStoryRender(slider.render),
  argTypes: {
    label: { control: "text", description: "Field label." },
    name: { control: "text", description: "Native input name." },
    value: { control: "number", description: "Current slider value." },
    min: { control: "number", description: "Minimum value." },
    max: { control: "number", description: "Maximum value." },
    step: { control: "number", description: "Step value." },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic accent color.",
    },
    disabled: { control: "boolean", description: "Disables interaction." },
    showValue: { control: "boolean", description: "Shows current value." },
    fullWidth: { control: "boolean", description: "Expands width to 100%." },
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
  disabled: false,
  showValue: true,
  fullWidth: false,
}

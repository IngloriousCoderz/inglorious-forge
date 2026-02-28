import { makeStoryRender } from "../../stories/notifyStory.js"
import { select } from "./index.js"

export default {
  title: "Controls/Select",
  tags: ["autodocs"],
  render: makeStoryRender(select.render),
  argTypes: {
    name: {
      control: "text",
      description: "Native HTML input name attribute.",
    },
    value: {
      control: "text",
      description: "Current select value.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size scale for paddings and font-size.",
    },
    disabled: {
      control: "boolean",
      description: "Disables user input and interaction.",
    },
    fullWidth: {
      control: "boolean",
      description: "Expands input width to 100% of its container.",
    },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
  },
  parameters: {
    docs: {
      description: {
        component: "Select field control.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  name: "animals",
  options: ["Cat", "Dog", "Seal"],
  value: "",
  size: "md",
  disabled: false,
  fullWidth: false,
}

export const ComplexOptions = {}
ComplexOptions.args = {
  ...Default.args,
  options: [
    { value: "cat", label: "Cat" },
    { value: "dog", label: "Dog" },
    { value: "seal", label: "Seal" },
  ],
}

export const Disabled = {}
Disabled.args = {
  ...Default.args,
  value: "Cat",
  disabled: true,
}

export const DisabledOption = {}
DisabledOption.args = {
  ...ComplexOptions.args,
  options: ComplexOptions.args.options.map((option, index) =>
    index % 2 ? { ...option, disabled: true } : option,
  ),
}

export const Small = {}
Small.args = {
  ...Default.args,
  size: "sm",
}

export const Large = {}
Large.args = {
  ...Default.args,
  size: "lg",
}

export const FullWidth = {}
FullWidth.args = {
  ...Default.args,
  fullWidth: true,
}

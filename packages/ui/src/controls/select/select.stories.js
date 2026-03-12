import { createRender } from "../../stories/notifyStory.js"
import { select } from "./index.js"

export default {
  title: "Controls/Select",
  tags: ["autodocs"],
  render: createRender(select),
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
    isDisabled: {
      control: "boolean",
      description: "Disables user input and interaction.",
    },
    isFullWidth: {
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
  isDisabled: false,
  isFullWidth: false,
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
  isDisabled: true,
}

export const DisabledOption = {}
DisabledOption.args = {
  ...ComplexOptions.args,
  options: ComplexOptions.args.options.map((option, index) =>
    index % 2 ? { ...option, isDisabled: true } : option,
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
  isFullWidth: true,
}

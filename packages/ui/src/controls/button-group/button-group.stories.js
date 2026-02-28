import { makeStoryRender } from "../../stories/notifyStory.js"
import { buttonGroup } from "."

export default {
  title: "Controls/ButtonGroup",
  tags: ["autodocs"],
  render: makeStoryRender(buttonGroup.render),
  argTypes: {
    value: {
      control: "object",
      description:
        "Selected value(s). String for single mode, array for multiple mode.",
    },
    multiple: {
      control: "boolean",
      description: "Enable multi-selection mode.",
    },
    direction: {
      control: "select",
      options: ["row", "column"],
      description: "Group direction.",
    },
    attached: {
      control: "boolean",
      description: "Visually attach adjacent buttons.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Default size for items.",
    },
    variant: {
      control: "select",
      options: ["default", "outline", "ghost"],
      description: "Default variant for items.",
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Default color intent for items.",
    },
    disabled: {
      control: "boolean",
      description: "Disables all buttons.",
    },
    buttons: {
      control: "object",
      description: "Items rendered as grouped buttons.",
    },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component: "Grouped action buttons with attached or spaced layout.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  id: "buttonGroup",
  type: "buttonGroup",
  value: "",
  multiple: false,
  direction: "row",
  attached: true,
  size: "md",
  variant: "outline",
  color: "primary",
  disabled: false,
  buttons: [
    { id: "left", value: "left", label: "Left" },
    { id: "center", value: "center", label: "Center" },
    { id: "right", value: "right", label: "Right" },
  ],
}

export const Vertical = {}
Vertical.args = {
  ...Default.args,
  direction: "column",
}

export const SingleSelection = {}
SingleSelection.args = {
  ...Default.args,
  value: "center",
  buttons: [
    { id: "left", value: "left", label: "Left" },
    { id: "center", value: "center", label: "Center" },
    { id: "right", value: "right", label: "Right" },
  ],
}

export const MultiSelection = {}
MultiSelection.args = {
  ...Default.args,
  multiple: true,
  value: ["left", "right"],
  buttons: [
    { id: "left", value: "left", label: "Left" },
    { id: "center", value: "center", label: "Center" },
    { id: "right", value: "right", label: "Right" },
  ],
}

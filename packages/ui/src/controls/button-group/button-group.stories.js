import { createRender } from "../../stories/notifyStory.js"
import { buttonGroup } from "."

export default {
  title: "Controls/ButtonGroup",
  tags: ["autodocs"],
  render: createRender(buttonGroup),
  argTypes: {
    value: {
      control: "object",
      description:
        "Selected value(s). String for single mode, array for multiple mode.",
    },
    isMultiple: {
      control: "boolean",
      description: "Enable multi-selection mode.",
    },
    direction: {
      control: "select",
      options: ["row", "column"],
      description: "Group direction.",
    },
    isAttached: {
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
      options: [
        "default",
        "primary",
        "secondary",
        "success",
        "warning",
        "error",
        "info",
      ],
      description: "Default color intent for items.",
    },
    isDisabled: {
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
  value: "",
  isMultiple: false,
  direction: "row",
  isAttached: true,
  size: "md",
  variant: "outline",
  isDisabled: false,
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
  isMultiple: true,
  value: ["left", "right"],
  buttons: [
    { id: "left", value: "left", label: "Left" },
    { id: "center", value: "center", label: "Center" },
    { id: "right", value: "right", label: "Right" },
  ],
}

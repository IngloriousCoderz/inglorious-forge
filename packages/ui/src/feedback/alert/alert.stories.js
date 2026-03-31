import { createRender } from "../../stories/notifyStory.js"
import { Alert } from "."

export default {
  title: "Feedback/Alert",
  tags: ["autodocs"],
  render: createRender(Alert),
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    severity: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
    variant: { control: "select", options: ["filled", "outlined"] },
    icon: { control: "text" },
    onClose: { action: "onClose" },
  },
}

export const Info = {
  args: {
    title: "Info",
    description: "This is an informational alert.",
    severity: "info",
  },
}

export const Success = {
  args: {
    title: "Success",
    description: "Your changes have been saved.",
    severity: "success",
  },
}

export const Warning = {
  args: {
    title: "Warning",
    description: "Please double-check your entries.",
    severity: "warning",
  },
}

export const Error = {
  args: {
    title: "Error",
    description: "Something went wrong.",
    severity: "error",
  },
}

export const Outlined = {
  args: {
    title: "Outlined Alert",
    description: "This alert uses the outlined variant.",
    variant: "outlined",
    severity: "info",
  },
}

export const Actionable = {
  args: {
    title: "Saved",
    description: "Your draft was saved.",
    severity: "success",
    action: "Undo",
    onClose: () => {},
  },
}

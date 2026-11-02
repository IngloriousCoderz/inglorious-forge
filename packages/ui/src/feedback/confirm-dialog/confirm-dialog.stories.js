import { createRender } from "../../stories/notify-story.js"
import { ConfirmDialog } from "."

export default {
  title: "Feedback/ConfirmDialog",
  tags: ["autodocs"],
  render: createRender(ConfirmDialog),
  argTypes: {
    tone: { control: "select", options: ["danger", "primary"] },
    isBusy: { control: "boolean" },
    onConfirm: { action: "onConfirm" },
    onCancel: { action: "onCancel" },
  },
}

export const Danger = {
  args: {
    isOpen: true,
    message: "Delete this event? This cannot be undone.",
    confirmLabel: "Delete",
    busyLabel: "Deleting…",
    cancelLabel: "Keep it",
  },
}

export const Primary = {
  args: {
    isOpen: true,
    tone: "primary",
    message: "Publish this event now?",
    confirmLabel: "Publish",
  },
}

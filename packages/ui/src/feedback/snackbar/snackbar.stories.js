import { createRender } from "../../stories/notifyStory.js"
import { Snackbar } from "."

export default {
  title: "Feedback/Snackbar",
  tags: ["autodocs"],
  render: createRender(Snackbar),
  argTypes: {
    isOpen: { control: "boolean" },
    message: { control: "text" },
    position: {
      control: "select",
      options: ["bottom-left", "bottom-right", "top-left", "top-right"],
    },
    onClose: { action: "onClose" },
  },
}

export const Default = {
  args: {
    isOpen: true,
    message: "Saved successfully",
    position: "bottom-left",
  },
}

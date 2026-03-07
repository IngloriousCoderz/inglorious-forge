import { createRender } from "../../stories/notifyStory.js"
import { snackbar } from "."

export default {
  title: "Feedback/Snackbar",
  tags: ["autodocs"],
  render: createRender(snackbar),
  argTypes: {
    open: { control: "boolean" },
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
    open: true,
    message: "Saved successfully",
    position: "bottom-left",
  },
}

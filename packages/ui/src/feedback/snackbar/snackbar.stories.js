import { createRender } from "../../stories/notify-story.js"
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
      options: [
        "bottom-left",
        "bottom-center",
        "bottom-right",
        "top-left",
        "top-center",
        "top-right",
      ],
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

// A phone app keeps a bar at the bottom: the snackbar rises above it.
export const AboveBottomNavigation = {
  args: {
    isOpen: true,
    message: "New version available",
    position: "bottom-center",
  },
  decorators: [
    (story) => {
      const container = document.createElement("div")
      container.style.setProperty("--iw-snackbar-offset-bottom", "4.875rem")
      container.append(story())
      return container
    },
  ],
}

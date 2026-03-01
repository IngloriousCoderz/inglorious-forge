import { render } from "@inglorious/web/test"

import { createRender } from "../../stories/notifyStory.js"
import { divider } from "."

export default {
  title: "Data Display/Divider",
  tags: ["autodocs"],
  render: createRender(divider),
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Divider direction.",
    },
    inset: {
      control: "boolean",
      description: "Applies start inset for sectional separators.",
    },
  },
  parameters: {
    docs: {
      description: {
        component: "Visual separator for grouping related content blocks.",
      },
    },
  },
}

export const Default = {
  args: {},
}

export const Vertical = {
  args: {
    ...Default.args,
    orientation: "vertical",
  },
  decorators: [
    (story) => {
      const container = document.createElement("div")
      container.style.height = "100px"
      container.style.display = "flex"
      render(story(), container)
      return container
    },
  ],
}

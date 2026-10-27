import { render } from "@inglorious/web/test"

import { createRender } from "../../stories/notify-story.js"
import { Divider } from "."

export default {
  title: "Data Display/Divider",
  tags: ["autodocs"],
  render: createRender(Divider),
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Divider direction.",
    },
    isInset: {
      control: "boolean",
      description: "Applies start inset for sectional separators.",
    },
    isDecorative: {
      control: "boolean",
      description:
        "Only visual: hidden from assistive tech, which otherwise announces a separator.",
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

export const Decorative = {
  args: { isDecorative: true },
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

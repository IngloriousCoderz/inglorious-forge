import { makeStoryRender } from "../../stories/notifyStory.js"
import { divider } from "."

export default {
  title: "Data Display/Divider",
  tags: ["autodocs"],
  render: makeStoryRender({ divider }),
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
  args: {
    id: "divider",
    type: "divider",
  },
}

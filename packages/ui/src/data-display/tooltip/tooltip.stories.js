import { html } from "@inglorious/web"

import { makeStoryRender } from "../../stories/notifyStory.js"
import { tooltip } from "."

export default {
  title: "Data Display/Tooltip",
  tags: ["autodocs"],
  render: makeStoryRender({ tooltip }),
  argTypes: {
    content: { control: "text", description: "Tooltip text." },
    position: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
      description: "Tooltip placement.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tooltip size scale.",
    },
    open: { control: "boolean", description: "Force tooltip visible." },
    maxWidth: { control: "text", description: "Max width CSS value." },
  },
  parameters: {
    docs: {
      description: {
        component: "Hover/focus tooltip primitive with configurable placement.",
      },
    },
  },
}

export const Default = {
  args: {
    id: "tooltip",
    type: "tooltip",
    children: html`<button type="button">Hover me</button>`,
    content: "Tooltip content",
    position: "bottom",
    size: "md",
    open: false,
    maxWidth: "20rem",
  },
}

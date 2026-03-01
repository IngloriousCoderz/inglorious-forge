import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { tooltip } from "."

export default {
  title: "Data Display/Tooltip",
  tags: ["autodocs"],
  render: createRender(tooltip),
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
    onClick: { action: "onClick" },
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
    children: html`<button type="button">Hover me</button>`,
    content: "Tooltip content",
    position: "bottom",
    size: "md",
    open: false,
    maxWidth: "20rem",
  },
}

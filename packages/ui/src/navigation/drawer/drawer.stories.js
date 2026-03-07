import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { drawer } from "."

export default {
  title: "Navigation/Drawer",
  tags: ["autodocs"],
  render: createRender(drawer),
  argTypes: {
    open: { control: "boolean", description: "Whether the drawer is visible." },
    anchor: {
      control: "select",
      options: ["left", "right", "top", "bottom"],
      description: "Edge from which the drawer appears.",
    },
    variant: {
      control: "select",
      options: ["temporary", "persistent", "permanent"],
      description: "Drawer behavior model.",
    },
    title: { control: "text", description: "Optional drawer header title." },
    onClose: { action: "onClose" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Overlay or persistent navigation panel anchored to a viewport edge.",
      },
    },
  },
}

export const Temporary = {
  args: {
    open: true,
    anchor: "left",
    variant: "temporary",
    title: "Workspace",
    children: html`<div>Navigation items</div>`,
  },
}

export const Persistent = {
  args: {
    open: true,
    anchor: "right",
    variant: "persistent",
    title: "Inspector",
    children: html`<div>Panel content</div>`,
  },
}

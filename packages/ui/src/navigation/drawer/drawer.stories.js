import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { drawer } from "."

export default {
  title: "Navigation/Drawer",
  tags: ["autodocs"],
  render: createRender(drawer),
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Whether the drawer is visible.",
    },
    anchor: {
      control: "select",
      options: ["left", "right", "top", "bottom"],
      description: "Edge from which the drawer appears.",
    },
    variant: {
      control: "select",
      options: ["temporary", "persistent", "permanent", "responsive"],
      description: "Drawer behavior model.",
    },
    breakpoint: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "Desktop breakpoint for responsive drawers.",
    },
    isCollapsed: {
      control: "boolean",
      description: "Whether a responsive drawer is collapsed on desktop.",
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
    isOpen: true,
    anchor: "left",
    variant: "temporary",
    title: "Workspace",
    children: html`<div>Navigation items</div>`,
  },
}

export const Persistent = {
  args: {
    isOpen: true,
    anchor: "right",
    variant: "persistent",
    title: "Inspector",
    children: html`<div>Panel content</div>`,
  },
}

export const Responsive = {
  args: {
    isOpen: true,
    anchor: "left",
    variant: "responsive",
    breakpoint: "lg",
    isCollapsed: false,
    title: "Workspace",
    children: html`<div>Responsive app-shell navigation</div>`,
  },
}

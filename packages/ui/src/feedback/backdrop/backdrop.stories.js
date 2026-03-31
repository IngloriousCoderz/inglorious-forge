import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { Backdrop } from "."

export default {
  title: "Feedback/Backdrop",
  tags: ["autodocs"],
  render: createRender(Backdrop),
  argTypes: {
    isOpen: { control: "boolean" },
    onClick: { action: "onClick" },
  },
}

export const Open = {
  args: {
    isOpen: true,
    children: html`<div>Loading content…</div>`,
  },
}

import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { backdrop } from "."

export default {
  title: "Feedback/Backdrop",
  tags: ["autodocs"],
  render: createRender(backdrop),
  argTypes: {
    open: { control: "boolean" },
    onClick: { action: "onClick" },
  },
}

export const Open = {
  args: {
    open: true,
    children: html`<div>Loading content…</div>`,
  },
}

import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { dialog } from "."

export default {
  title: "Feedback/Dialog",
  tags: ["autodocs"],
  render: createRender(dialog),
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    onClose: { action: "onClose" },
  },
}

export const Open = {
  args: {
    open: true,
    title: "Delete item",
    description: "This action cannot be undone.",
    children: html`<p>Are you sure you want to continue?</p>`,
    actions: html`<button class="iw-button iw-button-outline">Cancel</button>
      <button class="iw-button iw-button-primary">Confirm</button>`,
  },
}

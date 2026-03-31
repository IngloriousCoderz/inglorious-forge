import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { Dialog } from "."

export default {
  title: "Feedback/Dialog",
  tags: ["autodocs"],
  render: createRender(Dialog),
  argTypes: {
    isOpen: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    onClose: { action: "onClose" },
  },
}

export const Open = {
  args: {
    isOpen: true,
    title: "Delete item",
    description: "This action cannot be undone.",
    children: html`<p>Are you sure you want to continue?</p>`,
    actions: html`<button class="iw-button iw-button-outline">Cancel</button>
      <button class="iw-button iw-button-primary">Confirm</button>`,
  },
}

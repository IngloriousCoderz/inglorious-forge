import { html } from "@inglorious/web"

import { createRender } from "../../stories/notify-story.js"
import { Dialog } from "."

export default {
  title: "Feedback/Dialog",
  tags: ["autodocs"],
  render: createRender(Dialog),
  argTypes: {
    isOpen: { control: "boolean" },
    isModal: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    title: { control: "text" },
    description: { control: "text" },
    onClose: { action: "onClose" },
  },
}

// In place, so the docs page that shows every story stays usable.
export const Open = {
  args: {
    isOpen: true,
    isModal: false,
    title: "Delete item",
    description: "This action cannot be undone.",
    children: html`<p>Are you sure you want to continue?</p>`,
    actions: html`<button class="iw-button iw-button-outline">Cancel</button>
      <button class="iw-button iw-button-primary">Confirm</button>`,
  },
}

export const Small = {
  args: { ...Open.args, size: "sm" },
}

export const Medium = {
  args: { ...Open.args, size: "md" },
}

export const Large = {
  args: {
    ...Open.args,
    size: "lg",
    title: "Release notes",
    description: "What changed in this version.",
    children: html`<p>
      A wider dialog, for content that needs the room: tables, previews or
      longer text.
    </p>`,
  },
}

// Modal takes over the page, so it is left out of the docs page.
export const Modal = {
  tags: ["!autodocs"],
  args: { ...Open.args, isModal: true },
}

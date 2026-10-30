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
    variant: { control: "select", options: ["dialog", "sheet"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    title: { control: "text" },
    description: { control: "text" },
    closeLabel: { control: "text" },
    onClose: { action: "onClose" },
  },
}

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

export const Modal = {
  tags: ["!autodocs"],
  args: { ...Open.args, isModal: true },
}

export const Sheet = {
  tags: ["!autodocs"],
  args: { ...Open.args, isModal: true, variant: "sheet" },
}

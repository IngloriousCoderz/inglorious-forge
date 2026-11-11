import { html } from "@inglorious/web"

import { Icon } from "../../data-display/icon/index.js"
import { close } from "../../shared/icons.js"
import { createRender } from "../../stories/notify-story.js"
import { ActionSheet } from "."

export default {
  title: "Feedback/ActionSheet",
  tags: ["autodocs"],
  render: createRender(ActionSheet),
  argTypes: {
    onClose: { action: "onClose" },
  },
}

export const Default = {
  args: {
    isOpen: true,
    title: "Holiday photo",
    message: "Taken on 12 August",
    actions: [
      { label: "Share" },
      { label: "Edit" },
      { label: "Delete", color: "error" },
    ],
  },
}

export const WithIcons = {
  args: {
    isOpen: true,
    actions: [
      { label: "Copy link" },
      {
        label: "Remove",
        color: "error",
        icon: html`${Icon.render({ icon: close })}`,
      },
    ],
  },
}

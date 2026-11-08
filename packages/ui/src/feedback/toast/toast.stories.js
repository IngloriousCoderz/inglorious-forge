import checkCircleOutline from "@iconify-icons/material-symbols/check-circle-outline"
import infoOutline from "@iconify-icons/material-symbols/info-outline"
import warningOutline from "@iconify-icons/material-symbols/warning-outline"
import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"

import { Button } from "../../controls/button/index.js"
import { createEntityRender } from "../../stories/notify-story.js"
import { Toast } from "."

const DEMO_COLORS = ["success", "info", "warning", "default", "error"]
const DEMO_MESSAGES = [
  "Your application was sent",
  "The poster changed the job's date",
  "A job you applied to closes tomorrow",
  "Profile saved",
  "Couldn't upload the photo",
]

// The Toast entity with buttons that show demo toasts.
const ToastDemo = {
  ...Toast,

  add(entity, count) {
    for (let added = 0; added < count; added += 1) {
      const pick = entity.nextId % DEMO_COLORS.length
      Toast.show(entity, {
        message: DEMO_MESSAGES[pick],
        color: DEMO_COLORS[pick],
      })
    }
  },

  render(entity, api) {
    const id = entity.id
    return html`
      ${Button.render({
        children: "Add one",
        onClick: () => api.notify(`#${id}:add`, 1),
      })}
      ${Button.render({
        children: "Add three",
        variant: "outline",
        onClick: () => api.notify(`#${id}:add`, 3),
      })}
      ${Toast.render.call(this, entity, api)}
    `
  },
}

export default {
  title: "Feedback/Toast",
  tags: ["autodocs"],
  render: (args) => {
    const container = document.createElement("div")
    render(Toast.renderToaster(args), container)
    return container
  },
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    duration: { control: "number" },
    onClose: { action: "onClose" },
    onClick: { action: "onClick" },
  },
}

export const Default = {
  args: {
    position: "top-right",
    duration: null,
    toasts: [
      {
        id: 1,
        title: "You got the job!",
        message: "Wedding photography in Tuscany, 12 June",
        color: "success",
        icon: checkCircleOutline,
      },
      {
        id: 2,
        message: "The poster changed the job's date",
        color: "info",
        icon: infoOutline,
      },
      {
        id: 3,
        message: "A job you applied to was cancelled",
        color: "warning",
        icon: warningOutline,
      },
      { id: 4, message: "Profile saved" },
    ],
  },
}

export const Colors = {
  args: {
    position: "top-right",
    duration: null,
    toasts: ["primary", "secondary", "success", "warning", "error", "info"].map(
      (color, index) => ({ id: index, message: `A ${color} toast`, color }),
    ),
  },
}

/** Toasts close themselves after four seconds; hover one to pause it. */
export const SelfClosing = {
  render: createEntityRender({ ToastDemo }),
  args: {
    id: "toastDemo",
    type: "ToastDemo",
    position: "top-right",
    duration: 4000,
    max: 5,
    toasts: [],
  },
}

/** Toasts stay until closed: close one in the middle to see the others close the gap. */
export const Sticky = {
  render: createEntityRender({ ToastDemo }),
  args: {
    id: "toastDemo",
    type: "ToastDemo",
    position: "top-right",
    duration: null,
    max: 5,
    nextId: 5,
    toasts: [4, 3, 2, 1].map((id) => ({
      id,
      message: DEMO_MESSAGES[id % DEMO_COLORS.length],
      color: DEMO_COLORS[id % DEMO_COLORS.length],
    })),
  },
}

import { html } from "@inglorious/web"

import { createRender } from "../../stories/notify-story.js"
import { PullToRefresh } from "."

export default {
  title: "Feedback/PullToRefresh",
  tags: ["autodocs"],
  render: createRender(PullToRefresh),
  argTypes: {
    isRefreshing: { control: "boolean" },
    onRefresh: { action: "onRefresh" },
  },
}

const items = Array.from({ length: 30 }, (_, index) => `Message ${index + 1}`)

export const Default = {
  args: {
    children: html`<ul>
      ${items.map((item) => html`<li>${item}</li>`)}
    </ul>`,
  },
}

export const Refreshing = {
  args: { ...Default.args, isRefreshing: true },
}

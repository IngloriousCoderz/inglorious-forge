import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { accordion } from "."

export default {
  title: "Surfaces/Accordion",
  tags: ["autodocs"],
  render: createRender(accordion),
  argTypes: {
    items: {
      control: "object",
      description: "Accordion sections with title, content, and state flags.",
    },
    onItemToggle: { action: "onItemToggle" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Collapsible surface sections. Override `renderItem(item, index, props)` for custom row rendering.",
      },
    },
  },
}

export const Default = {
  args: {
    items: [
      {
        title: "Account",
        content: "Manage your account settings.",
        expanded: true,
      },
      {
        title: "Security",
        content: "Set up 2FA and app passwords.",
      },
      {
        title: "Billing",
        content: html`<strong>Invoices and subscriptions</strong>`,
      },
    ],
  },
}

export const WithIcons = {
  args: {
    items: [
      {
        icon: "👤",
        title: "Profile",
        content: "Public profile details",
        expanded: true,
      },
      { icon: "🔒", title: "Privacy", content: "Visibility and permissions" },
      { icon: "💳", title: "Payments", content: "Payment methods" },
    ],
  },
}

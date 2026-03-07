import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { card } from "."

export default {
  title: "Surfaces/Card",
  tags: ["autodocs"],
  render: createRender(card),
  argTypes: {
    title: {
      control: "text",
      description: "Default header title.",
    },
    subtitle: {
      control: "text",
      description: "Default header subtitle.",
    },
    children: {
      control: "text",
      description: "Default body content.",
    },
    footer: {
      control: "text",
      description: "Footer region content.",
    },
    hoverable: {
      control: "boolean",
      description: "Enable hover visual feedback.",
    },
    clickable: {
      control: "boolean",
      description: "Marks the card as interactive and clickable.",
    },
    fullWidth: {
      control: "boolean",
      description: "Expand to fill parent width.",
    },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Composite surface with overridable `renderHeader`, `renderBody`, and `renderFooter` methods.",
      },
    },
  },
}

export const Default = {
  args: {
    title: "Card Title",
    subtitle: "This is a card subtitle",
    children: "Body content",
  },
}

export const WithFooter = {
  args: {
    title: "Card with footer",
    children: "Body content",
    footer: html`<button class="iw-button iw-button-sm">Save</button>`,
  },
}

export const Interactive = {
  args: {
    title: "Interactive Card",
    subtitle: "Hover and click enabled",
    children: "Clickable body",
    hoverable: true,
    clickable: true,
  },
}

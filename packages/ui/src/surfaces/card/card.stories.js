import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { Card } from "."

export default {
  title: "Surfaces/Card",
  tags: ["autodocs"],
  render: createRender(Card),
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
    element: {
      control: "select",
      options: [
        "article",
        "section",
        "div",
        "main",
        "header",
        "footer",
        "nav",
        "aside",
      ],
      description: "Semantic element for the card root.",
    },
    headerPadding: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "Header padding preset.",
    },
    bodyPadding: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "Body padding preset.",
    },
    footerPadding: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "Footer padding preset.",
    },
    isHoverable: {
      control: "boolean",
      description: "Enable hover visual feedback.",
    },
    isClickable: {
      control: "boolean",
      description: "Marks the card as interactive and clickable.",
    },
    isFullWidth: {
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
    element: "article",
    headerPadding: "md",
    bodyPadding: "md",
    footerPadding: "md",
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
    isHoverable: true,
    isClickable: true,
  },
}

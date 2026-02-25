import { html } from "@inglorious/web"

import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { card } from "."

export default {
  title: "Widgets/Card",
  tags: ["autodocs"],
  render: makeStoryRender({ card }),
  argTypes: {
    ...notifyActionArgType,
    title: {
      control: "text",
      description: "Primary header text.",
    },
    subtitle: {
      control: "text",
      description: "Secondary header text.",
    },
    hoverable: {
      control: "boolean",
      description: "Enables hover visual feedback.",
    },
    clickable: {
      control: "boolean",
      description: "Marks the card as interactive and emits click events.",
    },
    fullWidth: {
      control: "boolean",
      description: "Expands card width to 100% of its container.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Container widget with overridable header/body/footer sub-renderers.",
      },
    },
    actions: {
      handles: ["click"],
    },
  },
}
export const Default = {}
Default.args = {
  id: "card",
  type: "card",
  title: "Card Title",
  subtitle: "This is a card subtitle",
  hoverable: false,
  clickable: false,
  fullWidth: false,
}

export const Hoverable = {}
Hoverable.args = {
  ...Default.args,
  hoverable: true,
}

export const Clickable = {}
Clickable.args = {
  ...Default.args,
  hoverable: true,
  clickable: true,
}

const cardWithFooter = {
  ...card,
  renderFooter(entity, api) {
    return html`<div class="iw-card-footer" style="display: flex; gap: 0.5rem;">
      ${entity.footerActions?.map(
        (action) =>
          html`<button
            class="iw-button iw-button-sm ${action.variant === "ghost"
              ? "iw-button-ghost"
              : ""}"
            @click=${() => api.notify(`#${entity.id}:${action.event}`)}
          >
            ${action.label}
          </button>`,
      )}
    </div>`
  },
}

export const WithFooter = {}
WithFooter.render = makeStoryRender({ cardWithFooter })
WithFooter.args = {
  id: "cardWithFooter",
  type: "cardWithFooter",
  title: "Card with Footer",
  subtitle: "This card has a footer section",
  footerActions: [
    { label: "Cancel", event: "cancel", variant: "ghost" },
    { label: "Save", event: "save" },
  ],
}

export const NoHeader = {}
NoHeader.args = {
  id: "card",
  type: "card",
  title: null,
  subtitle: null,
}

export const FullWidth = {}
FullWidth.args = {
  ...Default.args,
  fullWidth: true,
}

export const Interactive = {}
Interactive.render = makeStoryRender({ cardWithFooter })
Interactive.args = {
  id: "cardWithFooter",
  type: "cardWithFooter",
  title: "Interactive Card",
  subtitle: "Hover, click, and trigger footer actions",
  hoverable: true,
  clickable: true,
  fullWidth: false,
  footerActions: [
    { label: "Details", event: "details", variant: "ghost" },
    { label: "Open", event: "open" },
  ],
}

import { html } from "@inglorious/web"

import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { card } from "."

export default {
  title: "Widgets/Card",
  tags: ["autodocs"],
  render: makeStoryRender(card, "story-card"),
  argTypes: {
    ...notifyActionArgType,
    title: { control: "text" },
    subtitle: { control: "text" },
    hoverable: { control: "boolean" },
    clickable: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
  parameters: {
    actions: {
      handles: ["click"],
    },
  },
}
export const Default = {}
Default.args = {
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

const cardWithFooter = [
  ...card,
  {
    renderFooter(entity, api) {
      return html`<div
        class="iw-card-footer"
        style="display: flex; gap: 0.5rem;"
      >
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
  },
]

export const WithFooter = {}
WithFooter.render = makeStoryRender(cardWithFooter, "card-footer", {
  resolveByEntityType: true,
})
WithFooter.args = {
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
  title: null,
  subtitle: null,
}

export const FullWidth = {}
FullWidth.args = {
  ...Default.args,
  fullWidth: true,
}

export const Interactive = {}
Interactive.render = makeStoryRender(cardWithFooter, "card-interactive", {
  resolveByEntityType: true,
})
Interactive.args = {
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

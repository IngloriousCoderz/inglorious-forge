import { html } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"

import { card } from "."

export default {
  title: "Components/Card",
  tags: ["autodocs"],
  argTypes: {
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

const Template = (args) => {
  const container = document.createElement("div")
  const entity = { id: "story-card", ...args }
  const api = createMockApi(entity)
  render(card.render(entity, api), container)
  return container
}

export const Default = Template.bind({})
Default.args = {
  title: "Card Title",
  subtitle: "This is a card subtitle",
  hoverable: false,
  clickable: false,
  fullWidth: false,
}

export const Hoverable = Template.bind({})
Hoverable.args = {
  ...Default.args,
  hoverable: true,
}

export const Clickable = Template.bind({})
Clickable.args = {
  ...Default.args,
  hoverable: true,
  clickable: true,
}

export const WithFooter = () => {
  const container = document.createElement("div")
  const entity = {
    id: "card-footer",
    title: "Card with Footer",
    subtitle: "This card has a footer section",
    footer: html`<div style="display: flex; gap: 0.5rem;">
      <button class="iw-button iw-button--sm iw-button--ghost">Cancel</button>
      <button class="iw-button iw-button--sm">Save</button>
    </div>`,
  }
  const api = createMockApi(entity)
  render(card.render(entity, api), container)
  return container
}

export const NoHeader = Template.bind({})
NoHeader.args = {
  title: null,
  subtitle: null,
}

export const FullWidth = Template.bind({})
FullWidth.args = {
  ...Default.args,
  fullWidth: true,
}

export const CardGrid = () => {
  const container = document.createElement("div")
  container.style.display = "grid"
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))"
  container.style.gap = "1rem"

  const cards = [
    { title: "Card 1", subtitle: "First card" },
    { title: "Card 2", subtitle: "Second card", hoverable: true },
    { title: "Card 3", subtitle: "Third card", clickable: true },
  ]

  cards.forEach((cardData, index) => {
    const entity = { id: `grid-card-${index}`, ...cardData }
    const api = createMockApi(entity)
    render(card.render(entity, api), container)
  })

  return container
}

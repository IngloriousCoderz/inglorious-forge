import { html } from "@inglorious/web"

import { Icon } from "../../data-display/icon"
import { createRender } from "../../stories/notifyStory.js"
import { Fab } from "."

export default {
  title: "Controls/Fab",
  tags: ["autodocs"],
  render: createRender(Fab),
  argTypes: {
    children: { control: "text", description: "Content of the FAB." },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Semantic color intent.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Button size.",
    },
    isExtended: {
      control: "boolean",
      description: "Use extended pill shape.",
    },
    isDisabled: { control: "boolean", description: "Disables interaction." },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component: "Floating action button for prominent primary actions.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  children: PlusIcon(),
  color: "primary",
  size: "md",
  isExtended: false,
  isDisabled: false,
}

export const Small = {}
Small.args = {
  ...Default.args,
  children: PlusIcon(),
  size: "sm",
}

export const Large = {}
Large.args = {
  ...Default.args,
  children: PlusIcon(),
  size: "lg",
}

export const Extended = {}
Extended.args = {
  ...Default.args,
  isExtended: true,
  children: html`${PlusIcon()}<span>Create</span>`,
}

export const ExtendedSmall = {}
ExtendedSmall.args = {
  ...Default.args,
  size: "sm",
  isExtended: true,
  children: html`${PlusIcon()}<span>Create</span>`,
}

export const ExtendedLarge = {}
ExtendedLarge.args = {
  ...Default.args,
  size: "lg",
  isExtended: true,
  children: html`${PlusIcon()}<span>Create</span>`,
}

function PlusIcon() {
  return Icon.render({ children: "+", size: "lg" })
}

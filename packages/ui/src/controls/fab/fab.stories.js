import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { fab } from "."

export default {
  title: "Controls/Fab",
  tags: ["autodocs"],
  render: createRender(fab),
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
  children: "+",
  color: "primary",
  size: "md",
  isExtended: false,
  isDisabled: false,
}

export const Extended = {}
Extended.args = {
  ...Default.args,
  isExtended: true,
  children: html`<span>＋</span><span>Create</span>`,
}

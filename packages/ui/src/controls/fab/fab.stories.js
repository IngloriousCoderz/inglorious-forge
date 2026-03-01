import { html } from "@inglorious/web"

import { makeStoryRender } from "../../stories/notifyStory.js"
import { fab } from "."

export default {
  title: "Controls/Fab",
  tags: ["autodocs"],
  render: makeStoryRender(fab.render),
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
    extended: { control: "boolean", description: "Use extended pill shape." },
    disabled: { control: "boolean", description: "Disables interaction." },
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
  extended: false,
  disabled: false,
}

export const Extended = {}
Extended.args = {
  ...Default.args,
  extended: true,
  children: html`<span>＋</span><span>Create</span>`,
}

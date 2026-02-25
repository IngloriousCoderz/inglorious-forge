import { html } from "@inglorious/web"

import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { flex } from "."

export default {
  title: "Layout/Flex",
  tags: ["autodocs"],
  render: makeStoryRender({ flex }),
  argTypes: {
    ...notifyActionArgType,
    direction: {
      control: "select",
      options: ["row", "column", "row-reverse", "column-reverse"],
      description: "Flex main-axis direction.",
    },
    wrap: {
      control: "select",
      options: ["nowrap", "wrap", "wrap-reverse"],
      description: "Controls wrapping behavior of children.",
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around", "evenly"],
      description: "Main-axis distribution of children.",
    },
    align: {
      control: "select",
      options: ["stretch", "start", "center", "end", "baseline"],
      description: "Cross-axis alignment of children.",
    },
    gap: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "Spacing between children.",
    },
    inline: {
      control: "boolean",
      description: "Uses inline-flex instead of flex.",
    },
    fullWidth: {
      control: "boolean",
      description: "Expands container width to 100%.",
    },
    children: {
      control: "object",
      description: "Array of templates/content rendered as-is.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Layout primitive for one-dimensional arrangement of template children.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  id: "flex",
  type: "flex",
  direction: "row",
  wrap: "nowrap",
  justify: "start",
  align: "stretch",
  gap: "md",
  inline: false,
  fullWidth: false,
  children: [
    html`<div>First</div>`,
    html`<div>Second</div>`,
    html`<div>Third</div>`,
  ],
}

export const Vertical = {}
Vertical.args = {
  ...Default.args,
  direction: "column",
  children: [
    html`<div>Header</div>`,
    html`<div>Body</div>`,
    html`<div>Footer</div>`,
  ],
}

export const Wrapped = {}
Wrapped.args = {
  ...Default.args,
  wrap: "wrap",
  gap: "lg",
  children: [
    html`<div>One</div>`,
    html`<div>Two</div>`,
    html`<div>Three</div>`,
    html`<div>Four</div>`,
    html`<div>Five</div>`,
    html`<div>Six</div>`,
  ],
}

import { html } from "@inglorious/web"

import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { flex } from "."

export default {
  title: "Layout/Flex",
  tags: ["autodocs"],
  render: makeStoryRender(flex, "story-flex"),
  argTypes: {
    ...notifyActionArgType,
    direction: {
      control: "select",
      options: ["row", "column", "row-reverse", "column-reverse"],
    },
    wrap: {
      control: "select",
      options: ["nowrap", "wrap", "wrap-reverse"],
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    align: {
      control: "select",
      options: ["stretch", "start", "center", "end", "baseline"],
    },
    gap: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
    },
    inline: { control: "boolean" },
    fullWidth: { control: "boolean" },
    children: { control: "object" },
  },
}

export const Default = {}
Default.args = {
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

import { html } from "@inglorious/web"

import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { grid } from "."

export default {
  title: "Layout/Grid",
  tags: ["autodocs"],
  render: makeStoryRender(grid, "story-grid"),
  argTypes: {
    ...notifyActionArgType,
    columns: { control: "number" },
    minColumnWidth: { control: "text" },
    gap: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
    },
    align: {
      control: "select",
      options: ["stretch", "start", "center", "end"],
    },
    justify: {
      control: "select",
      options: ["stretch", "start", "center", "end"],
    },
    fullWidth: { control: "boolean" },
    children: { control: "object" },
  },
}

export const Default = {}
Default.args = {
  columns: 3,
  gap: "md",
  align: "stretch",
  justify: "stretch",
  fullWidth: false,
  children: [
    html`<div>Cell A</div>`,
    html`<div>Cell B</div>`,
    html`<div>Cell C</div>`,
  ],
}

export const AutoFit = {}
AutoFit.args = {
  ...Default.args,
  minColumnWidth: "180px",
  children: [
    html`<div>Product</div>`,
    html`<div>Price</div>`,
    html`<div>Status</div>`,
    html`<div>Actions</div>`,
    html`<div>Notes</div>`,
  ],
}

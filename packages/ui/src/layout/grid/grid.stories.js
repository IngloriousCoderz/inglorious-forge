import { html } from "@inglorious/web"

import { makeStoryRender } from "../../stories/notifyStory.js"
import { grid } from "."

export default {
  title: "Layout/Grid",
  tags: ["autodocs"],
  render: makeStoryRender(grid.render),
  argTypes: {
    columns: {
      control: "number",
      description: "Fixed number of columns when auto-fit is not used.",
    },
    minColumnWidth: {
      control: "text",
      description: "Enables auto-fit columns with minmax(minColumnWidth, 1fr).",
    },
    gap: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "Spacing between grid cells.",
    },
    align: {
      control: "select",
      options: ["stretch", "start", "center", "end"],
      description: "Cross-axis alignment for cell content.",
    },
    justify: {
      control: "select",
      options: ["stretch", "start", "center", "end"],
      description: "Inline-axis alignment for cell content.",
    },
    fullWidth: {
      control: "boolean",
      description: "Expands container width to 100%.",
    },
    children: {
      control: "object",
      description: "Array of templates/content rendered as-is.",
    },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Layout primitive for two-dimensional arrangement of template children.",
      },
    },
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

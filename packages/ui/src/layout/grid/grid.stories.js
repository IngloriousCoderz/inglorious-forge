import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { Grid } from "."

export default {
  title: "Layout/Grid",
  tags: ["autodocs"],
  render: createRender(Grid),
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
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "Inner padding for the grid container.",
    },
    element: {
      control: "select",
      options: [
        "div",
        "section",
        "main",
        "header",
        "footer",
        "nav",
        "aside",
        "article",
      ],
      description: "Semantic element for the container.",
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
    isFullWidth: {
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

export const Default = {
  args: {
    align: "stretch",
    justify: "stretch",
    isFullWidth: false,
    gap: "md",
    padding: "none",
    element: "div",
    children: [
      html`<div>Product</div>`,
      html`<div>Price</div>`,
      html`<div>Status</div>`,
      html`<div>Actions</div>`,
      html`<div>Notes</div>`,
    ],
    columns: 3,
  },
}

export const AutoFit = {
  args: {
    ...Default.args,
    columns: 0,
    minColumnWidth: "180px",
  },
}

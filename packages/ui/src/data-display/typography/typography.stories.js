import { createRender } from "../../stories/notifyStory.js"
import { typography } from "."

export default {
  title: "Data Display/Typography",
  tags: ["autodocs"],
  render: createRender(typography),
  argTypes: {
    children: { control: "text", description: "Text content." },
    variant: {
      control: "select",
      options: ["body", "h1", "h2", "h3", "caption", "overline"],
      description: "Visual text variant.",
    },
    align: {
      control: "select",
      options: ["left", "center", "right"],
      description: "Horizontal text alignment.",
    },
    weight: { control: "text", description: "Optional CSS font-weight value." },
    color: { control: "text", description: "Optional CSS color value." },
    noWrap: {
      control: "boolean",
      description: "Single-line ellipsis behavior.",
    },
    gutterBottom: { control: "boolean", description: "Add bottom spacing." },
  },
  parameters: {
    docs: {
      description: {
        component: "Typography primitive for headings, body text, and labels.",
      },
    },
  },
}

export const Default = {
  args: {
    children: "The quick brown fox jumps over the lazy dog.",
    variant: "body",
    align: "left",
    noWrap: false,
    gutterBottom: false,
  },
}

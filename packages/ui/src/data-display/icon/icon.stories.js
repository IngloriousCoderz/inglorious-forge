import { createRender } from "../../stories/notifyStory.js"
import { icon } from "."

export default {
  title: "Data Display/Icon",
  tags: ["autodocs"],
  render: createRender(icon),
  argTypes: {
    children: { control: "text", description: "Icon glyph or inline content." },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Icon size scale.",
    },
    color: {
      control: "text",
      description:
        "Any valid CSS color value (`current` keeps inherited color).",
    },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Generic inline icon primitive for glyphs, emoji, or custom symbol text. See `Data Display/Icon/Implementations` for Font Awesome and Lucide setup patterns.",
      },
    },
  },
}

export const Default = {
  args: {
    children: "★",
    size: "md",
    color: "current",
  },
}

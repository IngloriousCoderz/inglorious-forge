import { createRender } from "../../stories/notify-story.js"
import { Rating } from "."

export default {
  title: "Controls/Rating",
  tags: ["autodocs"],
  render: createRender(Rating),
  argTypes: {
    value: { control: "number", description: "Current rating value." },
    max: { control: "number", description: "Maximum rating value." },
    name: {
      control: "text",
      description: "Groups the radios and names the value in a form.",
    },
    ariaLabel: {
      control: "text",
      description: 'Names the group for assistive tech. Defaults to "Rating".',
    },
    isDisabled: { control: "boolean", description: "Disables interaction." },
    isReadOnly: {
      control: "boolean",
      description: "Shows value without interaction.",
    },
    symbol: { control: "text", description: "Filled symbol." },
    emptySymbol: { control: "text", description: "Unfilled symbol." },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Symbol size.",
    },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Discrete rating selector rendered as stars (or custom symbols).",
      },
    },
  },
}

export const Default = {}
Default.args = {
  value: 3,
  max: 5,
  isDisabled: false,
  isReadOnly: false,
  symbol: "★",
  emptySymbol: "☆",
  size: "md",
}

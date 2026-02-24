import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { rating } from "."

export default {
  title: "Controls/Rating",
  tags: ["autodocs"],
  render: makeStoryRender(rating, "story-rating"),
  argTypes: {
    ...notifyActionArgType,
    value: { control: "number", description: "Current rating value." },
    max: { control: "number", description: "Maximum rating value." },
    disabled: { control: "boolean", description: "Disables interaction." },
    readonly: {
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
  disabled: false,
  readonly: false,
  symbol: "★",
  emptySymbol: "☆",
  size: "md",
}

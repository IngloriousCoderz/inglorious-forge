import { createRender } from "../../stories/notifyStory.js"
import { Skeleton } from "."

export default {
  title: "Feedback/Skeleton",
  tags: ["autodocs"],
  render: createRender(Skeleton),
  argTypes: {
    variant: { control: "select", options: ["text", "rect", "circle"] },
    width: { control: "text" },
    height: { control: "text" },
    lines: { control: "number" },
  },
}

export const Text = {
  args: {
    variant: "text",
    width: "60%",
  },
}

export const Rect = {
  args: {
    variant: "rect",
    width: 240,
    height: 120,
  },
}

export const Circle = {
  args: {
    variant: "circle",
    width: 48,
    height: 48,
  },
}

export const MultiLine = {
  args: {
    lines: 3,
    width: "100%",
  },
}

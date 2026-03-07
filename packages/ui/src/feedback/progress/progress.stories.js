import { createRender } from "../../stories/notifyStory.js"
import { progress } from "."

export default {
  title: "Feedback/Progress",
  tags: ["autodocs"],
  render: createRender(progress),
  argTypes: {
    variant: { control: "select", options: ["linear", "circular"] },
    value: { control: "number" },
    size: { control: "number" },
    thickness: { control: "number" },
  },
}

export const Linear = {
  args: {
    variant: "linear",
    value: 40,
  },
}

export const LinearIndeterminate = {
  args: {
    variant: "linear",
  },
}

export const Circular = {
  args: {
    variant: "circular",
    value: 65,
    size: 48,
    thickness: 4,
  },
}

export const CircularIndeterminate = {
  args: {
    variant: "circular",
    size: 48,
  },
}

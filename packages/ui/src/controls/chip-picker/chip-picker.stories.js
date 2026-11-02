import { createRender } from "../../stories/notify-story.js"
import { ChipPicker } from "."

export default {
  title: "Controls/ChipPicker",
  tags: ["autodocs"],
  render: createRender(ChipPicker),
  argTypes: { onToggle: { action: "onToggle" } },
}

export const Default = {
  args: {
    label: "What do you do?",
    hint: "Pick as many as you like.",
    options: [
      { value: "photographer", label: "Photographer" },
      { value: "videographer", label: "Videographer" },
      { value: "dj", label: "DJ" },
    ],
    value: ["videographer"],
  },
}

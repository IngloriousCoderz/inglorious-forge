import { createRender } from "../../stories/notify-story.js"
import { Lightbox } from "."

export default {
  title: "Data Display/Lightbox",
  tags: ["autodocs"],
  render: createRender(Lightbox),
  argTypes: {
    index: { control: "number" },
    onStep: { action: "onStep" },
    onClose: { action: "onClose" },
  },
}

export const Default = {
  args: {
    isOpen: true,
    index: 0,
    images: [
      "https://picsum.photos/id/1011/1200/800",
      "https://picsum.photos/id/1015/1200/800",
      "https://picsum.photos/id/1016/800/1200",
    ],
  },
}

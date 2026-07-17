import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { BeforeAfter } from "./index.js"

const before = {
  src: "https://picsum.photos/id/1015/800/500?grayscale",
  alt: "Before",
}
const after = {
  src: "https://picsum.photos/id/1015/800/500",
  alt: "After",
}

export default {
  title: "Data Display/BeforeAfter",
  tags: ["autodocs"],
  render: createEntityRender({ BeforeAfter }),
  argTypes: {
    ...notifyActionArgType,
    label: { control: "text", description: "Accessible label for the slider." },
    position: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Divider position as a percentage (0-100).",
    },
    step: {
      control: "number",
      description: "Keyboard increment (percent) for arrow keys.",
    },
    isDisabled: { control: "boolean", description: "Disable interaction." },
    isFullWidth: {
      control: "boolean",
      description: "Expand to container width.",
    },
    before: { control: "object", description: "Before image { src, alt }." },
    after: { control: "object", description: "After image { src, alt }." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Before/after image comparison slider. The reveal is pure CSS (clip-path); the divider position is the only piece of entity state. Drag anywhere, or focus and use arrow keys / Home / End.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  id: "before-after",
  type: "BeforeAfter",
  label: "Before and after comparison",
  position: 50,
  step: 1,
  isDisabled: false,
  isFullWidth: true,
  before,
  after,
}

export const StartLeft = {}
StartLeft.args = {
  ...Default.args,
  id: "before-after-left",
  position: 15,
}

export const Disabled = {}
Disabled.args = {
  ...Default.args,
  id: "before-after-disabled",
  isDisabled: true,
}

import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { ImageCropper } from "./index.js"

export default {
  title: "Controls/ImageCropper",
  tags: ["autodocs"],
  render: createEntityRender({ ImageCropper }),
  argTypes: {
    ...notifyActionArgType,
    label: { control: "text", description: "Accessible label for the stage." },
    src: { control: "text", description: "Image URL, often a blob: URL." },
    alt: { control: "text", description: "Alternative text for the image." },
    aspectRatio: {
      control: "number",
      description:
        "Output width/height in pixels to lock the frame to. Empty crops freely.",
    },
    minSize: {
      control: { type: "range", min: 0.05, max: 1, step: 0.05 },
      description: "Smallest frame side, as a fraction of the image.",
    },
    step: {
      control: "number",
      description: "Keyboard increment, as a fraction of the image.",
    },
    rect: {
      control: "object",
      description: "The frame { x, y, w, h } in image fractions (0-1).",
    },
    isDisabled: { control: "boolean", description: "Disable interaction." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Movable, resizable crop frame over a whole image. The frame is kept in image fractions, so it maps onto the real pixels whatever the display size; `cropImage(file, rect, options)` then crops and encodes in the browser. Drag the frame to move it, its edges and corners to resize it, pinch or scroll to scale it. With focus: arrows move, Shift+arrows resize, +/- scale, Home resets.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  id: "image-cropper",
  type: "ImageCropper",
  label: "Crop the photo",
  src: "https://picsum.photos/id/1015/1200/700",
  alt: "River between mountains",
  aspectRatio: null,
  minSize: 0.1,
  step: 0.02,
  isDisabled: false,
}

export const Square = {}
Square.args = {
  ...Default.args,
  id: "image-cropper-square",
  aspectRatio: 1,
}

export const Banner = {}
Banner.args = {
  ...Default.args,
  id: "image-cropper-banner",
  aspectRatio: 21 / 9,
}

export const Restored = {}
Restored.args = {
  ...Default.args,
  id: "image-cropper-restored",
  rect: { x: 0.3, y: 0.2, w: 0.4, h: 0.5 },
}

export const Disabled = {}
Disabled.args = {
  ...Default.args,
  id: "image-cropper-disabled",
  rect: { x: 0.1, y: 0.1, w: 0.6, h: 0.6 },
  isDisabled: true,
}

import { html } from "@inglorious/web"

import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { Carousel } from "./index.js"

const COLORS = ["#22d3ee", "#4f46e5", "#f59e0b", "#10b981", "#ef4444"]

const slide = (index) =>
  html`<div
    style="display:grid;place-items:center;height:14rem;border-radius:0.5rem;
           background:${COLORS[index]};color:#fff;font:700 2rem sans-serif;"
  >
    ${index + 1}
  </div>`

const items = COLORS.map((color, index) => slide(index))

export default {
  title: "Controls/Carousel",
  tags: ["autodocs"],
  render: createEntityRender({ Carousel }),
  argTypes: {
    ...notifyActionArgType,
    label: { control: "text", description: "Accessible label." },
    page: {
      control: "number",
      description: "Index of the item the viewport settled on.",
    },
    axis: {
      control: "inline-radio",
      options: ["x", "y"],
      description: "Scroll direction.",
    },
    gap: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "Spacing between items.",
    },
    align: {
      control: "select",
      options: ["stretch", "start", "center", "end"],
      description: "Off-axis alignment of items.",
    },
    hasArrows: {
      control: "boolean",
      description: "Show previous/next arrows.",
    },
    hasIndicators: { control: "boolean", description: "Show pagination dots." },
    isFullWidth: {
      control: "boolean",
      description: "Expand to container width.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Carousel built on CSS scroll snapping: swiping, momentum and snapping come from the browser, while the entity holds the current page. Drag, use the arrows or dots, or focus the viewport and use the arrow keys / Home / End.",
      },
    },
  },
}

export const Default = {}
Default.args = {
  id: "carousel",
  type: "Carousel",
  label: "Example carousel",
  items,
  page: 0,
  axis: "x",
  gap: "md",
  align: "stretch",
  hasArrows: true,
  hasIndicators: true,
  isFullWidth: true,
}

export const StartOnThirdSlide = {}
StartOnThirdSlide.args = {
  ...Default.args,
  id: "carousel-third",
  page: 2,
}

/**
 * Vertical carousels need a height to scroll within: set
 * `--iw-carousel-viewport-size` (it defaults to `20rem`).
 */
export const Vertical = {}
Vertical.args = {
  ...Default.args,
  id: "carousel-vertical",
  axis: "y",
}
Vertical.decorators = [
  (story) =>
    html`<div style="--iw-carousel-viewport-size: 14rem">${story()}</div>`,
]

export const Bare = {}
Bare.args = {
  ...Default.args,
  id: "carousel-bare",
  hasArrows: false,
  hasIndicators: false,
}

/**
 * Several items at once, by overriding `--iw-carousel-item-size`.
 * Trailing items share the final scroll position, so the last pages settle
 * together — one item per view is the exact case.
 */
export const ManyPerView = {}
ManyPerView.args = { ...Default.args, id: "carousel-many" }
ManyPerView.decorators = [
  (story) => html`<div style="--iw-carousel-item-size: 14rem">${story()}</div>`,
]

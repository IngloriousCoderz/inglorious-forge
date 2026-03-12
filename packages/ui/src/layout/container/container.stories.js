import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { container } from "."

export default {
  title: "Layout/Container",
  tags: ["autodocs"],
  render: createRender(container),
  argTypes: {
    maxWidth: {
      control: "text",
      description:
        "Maximum width. Presets: xs/sm/md/lg/xl, CSS length, number (px), or false/none.",
    },
    isFixed: {
      control: "boolean",
      description: "Keeps container width fixed at the selected max width.",
    },
    isGutterless: {
      control: "boolean",
      description: "Removes horizontal padding.",
    },
    isCentered: {
      control: "boolean",
      description: "Centers container with auto horizontal margins.",
    },
    children: {
      control: "text",
      description: "Container content.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Responsive width constraint wrapper for page sections and app shells.",
      },
    },
  },
}

export const Default = {
  args: {
    maxWidth: "lg",
    isFixed: false,
    isGutterless: false,
    isCentered: true,
    children: html`<div style="padding: 1rem; border: 1px dashed currentColor;">
      Content inside container
    </div>`,
  },
}

export const WidthPresets = {
  render: () =>
    html`<div style="display: grid; gap: 0.75rem;">
      ${["xs", "sm", "md", "lg", "xl"].map(
        (size) =>
          html`<div>
            <div
              style="font-size: 0.875rem; opacity: 0.85; margin-bottom: 0.25rem;"
            >
              ${size}
            </div>
            ${container.render({
              maxWidth: size,
              children: html`<div
                style="padding: 0.5rem 0.75rem; border: 1px solid var(--iw-color-border);"
              >
                ${size} container
              </div>`,
            })}
          </div>`,
      )}
    </div>`,
}

export const WithoutGutters = {
  args: {
    ...Default.args,
    isGutterless: true,
    children: html`<div
      style="padding: 1rem; background: color-mix(in srgb, var(--iw-color-primary) 14%, transparent);"
    >
      Edge-to-edge content
    </div>`,
  },
}

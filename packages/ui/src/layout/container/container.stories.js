import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { Container } from "."

export default {
  title: "Layout/Container",
  tags: ["autodocs"],
  render: createRender(Container),
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
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "Horizontal padding preset.",
    },
    isCentered: {
      control: "boolean",
      description: "Centers container with auto horizontal margins.",
    },
    element: {
      control: "select",
      options: [
        "div",
        "section",
        "main",
        "header",
        "footer",
        "nav",
        "aside",
        "article",
      ],
      description: "Semantic element for the container.",
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
    padding: undefined,
    isCentered: true,
    element: "div",
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
            ${Container.render({
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

export const WithoutPadding = {
  args: {
    ...Default.args,
    padding: "none",
    children: html`<div
      style="padding: 1rem; background: color-mix(in srgb, var(--iw-color-primary) 14%, transparent);"
    >
      Edge-to-edge content
    </div>`,
  },
}

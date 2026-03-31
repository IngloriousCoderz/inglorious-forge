import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { Paper } from "."

export default {
  title: "Surfaces/Paper",
  tags: ["autodocs"],
  render: createRender(Paper),
  argTypes: {
    variant: {
      control: "select",
      options: ["elevated", "outlined"],
      description: "Visual style: shadowed surface or border-only surface.",
    },
    elevation: {
      control: { type: "number", min: 0, max: 4, step: 1 },
      description: "Shadow intensity level for elevated variant (0-4).",
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
      description: "Internal spacing preset for content.",
    },
    radius: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl", "2xl", "full"],
      description: "Corner roundness preset for the surface.",
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
      description: "Semantic element for the surface.",
    },
    children: {
      control: "text",
      description: "Paper body content.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Base surface container used for elevated or outlined blocks.",
      },
    },
  },
}

export const Elevated = {
  args: {
    variant: "elevated",
    elevation: 2,
    padding: "md",
    radius: "md",
    element: "div",
    children: "Surface content",
  },
}

export const Outlined = {
  args: {
    variant: "outlined",
    padding: "md",
    radius: "md",
    element: "div",
    children: "Outlined surface",
  },
}

export const AllElevations = {
  render: () =>
    html`<div
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: 1rem;"
    >
      ${[0, 1, 2, 3, 4].map(
        (level) =>
          html`<div>
            ${Paper.render({
              variant: "elevated",
              elevation: level,
              padding: "md",
              children: html`<strong>Elevation ${level}</strong>`,
            })}
          </div>`,
      )}
    </div>`,
}

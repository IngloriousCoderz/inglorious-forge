import { html } from "@inglorious/web"

import { createRender } from "../../stories/notifyStory.js"
import { appBar } from "."

export default {
  title: "Surfaces/App Bar",
  tags: ["autodocs"],
  render: createRender(appBar),
  argTypes: {
    title: {
      control: "text",
      description: "Primary heading content in the bar.",
    },
    subtitle: {
      control: "text",
      description: "Secondary supporting text under the title.",
    },
    leading: {
      control: "text",
      description: "Optional start-aligned control area.",
    },
    trailing: {
      control: "text",
      description: "Optional end-aligned actions.",
    },
    position: {
      control: "select",
      options: ["static", "sticky", "fixed", "absolute", "relative"],
      description: "Positioning strategy for the bar.",
    },
    placement: {
      control: "select",
      options: ["top", "bottom"],
      description: "Anchor the bar to the top or bottom edge.",
    },
    variant: {
      control: "select",
      options: ["regular", "dense", "prominent"],
      description: "Height and vertical rhythm preset.",
    },
    color: {
      control: "select",
      options: ["default", "primary", "secondary", "transparent", "inherit"],
      description: "Color scheme for the app bar.",
    },
    isDense: {
      control: "boolean",
      description: 'Legacy compact mode alias (forces `variant="dense"`).',
    },
    isElevated: {
      control: "boolean",
      description: "Enable drop shadow separation from content.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Top application chrome with optional leading controls, title area, content slot, and trailing actions.",
      },
    },
  },
}

export const Default = {
  args: {
    title: "Dashboard",
    subtitle: "Workspace",
    variant: "regular",
    color: "default",
    placement: "top",
    leading: html`<button class="iw-icon-button">☰</button>`,
    trailing: html`<button class="iw-button iw-button-outline iw-button-sm">
      New
    </button>`,
  },
}

export const WithContent = {
  args: {
    title: "Projects",
    color: "default",
    children: html`<input class="iw-input-input" placeholder="Search" />`,
    trailing: html`<button class="iw-icon-button">⚙</button>`,
  },
}

export const Prominent = {
  args: {
    title: "Design System",
    subtitle: "Surfaces and layout tokens",
    variant: "prominent",
    color: "primary",
    leading: html`<button class="iw-icon-button">←</button>`,
    trailing: html`<button class="iw-icon-button">⋯</button>`,
  },
}

export const BottomAppBar = {
  args: {
    title: "Playback",
    subtitle: "Now playing",
    color: "secondary",
    position: "fixed",
    placement: "bottom",
    trailing: html`<button class="iw-icon-button">⏯</button>`,
  },
}

import { createRender } from "../../stories/notify-story.js"
import { SpeedDial } from "."

export default {
  title: "Navigation/Speed Dial",
  tags: ["autodocs"],
  render: createRender(SpeedDial),
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Whether actions are expanded.",
    },
    direction: {
      control: "select",
      options: ["up", "down", "left", "right"],
      description: "Direction in which actions expand.",
    },
    onToggle: { action: "onToggle" },
    onAction: { action: "onAction" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Floating action entry point with overridable action rendering.",
      },
    },
  },
}

export const Default = {
  args: {
    isOpen: true,
    actions: [
      { value: "edit", icon: "✎", label: "Edit" },
      { value: "share", icon: "↗", label: "Share" },
      { value: "print", icon: "⎙", label: "Print" },
    ],
  },
}

/** Actions with only an icon are named by `formatActionLabel`, counted from 1. */
export const UnlabelledActions = {
  args: {
    isOpen: true,
    ariaLabel: "Azioni rapide",
    formatActionLabel: (index) => `Azione ${index}`,
    actions: [
      { value: "edit", icon: "✎" },
      { value: "share", icon: "↗" },
    ],
  },
}

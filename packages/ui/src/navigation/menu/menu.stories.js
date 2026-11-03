import { Form } from "@inglorious/web/form"

import { createRender } from "../../stories/notify-story.js"
import { Menu } from "."

export default {
  title: "Navigation/Menu",
  tags: ["autodocs"],
  render: createRender(Menu),
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Whether the menu is visible.",
    },
    items: { control: "object", description: "Menu items and separators." },
    isDense: { control: "boolean", description: "Compact item spacing." },
    trigger: {
      control: "text",
      description: "Content of a button that opens the menu as a popover.",
    },
    onToggle: { action: "onToggle" },
    onItemClick: { action: "onItemClick" },
  },
  parameters: {
    docs: {
      description: {
        component: "Floating action list with overridable `renderItem`.",
      },
    },
  },
}

export const Default = {
  args: {
    isOpen: true,
    items: [
      { label: "Profile", icon: "👤" },
      { label: "Settings", icon: "⚙" },
      { hasDivider: true },
      { label: "Logout", trailing: "⌘Q" },
    ],
  },
}

export const WithTrigger = {
  args: {
    id: "story-menu",
    trigger: "Actions",
    items: Default.args.items,
  },
}

/** A menu with a trigger inside a form opens as anywhere else: the Form type cancels only buttons that would submit or reset the form. */
export const InsideAForm = {
  args: WithTrigger.args,
  decorators: [
    (story) => {
      Form.init()
      const form = document.createElement("form")
      form.append(story())
      return form
    },
  ],
}

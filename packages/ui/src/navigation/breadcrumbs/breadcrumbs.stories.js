import { createRender } from "../../stories/notify-story.js"
import { Breadcrumbs } from "."

export default {
  title: "Navigation/Breadcrumbs",
  tags: ["autodocs"],
  render: createRender(Breadcrumbs),
  argTypes: {
    items: { control: "object", description: "Ordered breadcrumb path items." },
    separator: {
      control: "text",
      description: "Separator rendered between items.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Hierarchical path navigation with overridable `renderItem`.",
      },
    },
  },
}

export const Default = {
  args: {
    items: [
      { label: "Home", href: "#" },
      { label: "Library", href: "#" },
      { label: "Data" },
    ],
  },
}

/** The navigation's accessible name follows the app's language through `ariaLabel`. */
export const Localized = {
  args: {
    ariaLabel: "Percorso",
    items: [
      { label: "Home", href: "#" },
      { label: "Libreria", href: "#" },
      { label: "Dati" },
    ],
  },
}

import { createRender } from "../../stories/notifyStory.js"
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

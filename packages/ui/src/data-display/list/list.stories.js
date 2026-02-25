import { makeStoryRender } from "../../stories/notifyStory.js"
import { list } from "."

export default {
  title: "Data Display/List",
  tags: ["autodocs"],
  render: makeStoryRender({ list }),
  argTypes: {
    items: {
      control: "object",
      description: "Items rendered by default renderer.",
    },
    ordered: { control: "boolean", description: "Use ordered list semantics." },
    dense: { control: "boolean", description: "Reduce item vertical spacing." },
    divided: {
      control: "boolean",
      description: "Add separators between items.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "List primitive with optional ordered mode and overridable `renderItem(entity, payload, api)` sub-render.",
      },
    },
  },
}

export const Default = {
  args: {
    id: "list",
    type: "list",
    items: [
      { id: "a", label: "First item" },
      { id: "b", label: "Second item" },
      { id: "c", label: "Third item" },
    ],
    ordered: false,
    dense: false,
    divided: false,
  },
}

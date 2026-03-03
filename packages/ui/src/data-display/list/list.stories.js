import { createRender } from "../../stories/notifyStory.js"
import { list } from "."

export default {
  title: "Data Display/List",
  tags: ["autodocs"],
  render: createRender(list),
  argTypes: {
    items: {
      control: "object",
      description: "Items rendered by default renderer.",
    },
    isOrdered: {
      control: "boolean",
      description: "Use ordered list semantics.",
    },
    isDense: {
      control: "boolean",
      description: "Reduce item vertical spacing.",
    },
    isDivided: {
      control: "boolean",
      description: "Add separators between items.",
    },
    onItemClick: { action: "onItemClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "List primitive with optional ordered mode and overridable `renderItem(props, payload)` sub-render.",
      },
    },
  },
}

export const Default = {
  args: {
    items: [
      { id: "a", label: "First item" },
      { id: "b", label: "Second item" },
      { id: "c", label: "Third item" },
    ],
    isOrdered: false,
    isDense: false,
    isDivided: false,
  },
}

export const Ordered = {
  args: {
    ...Default.args,
    isOrdered: true,
  },
}

export const Dense = {
  args: {
    ...Default.args,
    isDense: true,
  },
}

export const Divided = {
  args: {
    ...Default.args,
    isDivided: true,
  },
}

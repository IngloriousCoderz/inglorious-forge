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
    inset: {
      control: "boolean",
      description: "Align items without icons to those with icons.",
    },
    onItemClick: { action: "onItemClick" },
    onItemToggle: { action: "onItemToggle" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "List primitive with optional ordered mode and overridable `renderItem(props, payload)` sub-render. Click events use `onItemClick(item, path)` and toggle events use `onItemToggle(item, path)`.",
      },
    },
  },
}

export const Default = {
  args: {
    items: [
      { id: "a", primary: "First item", secondary: "Secondary text" },
      { id: "b", primary: "Second item", secondary: "More details" },
      { id: "c", primary: "Third item", secondary: "Optional caption" },
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

export const WithIcons = {
  args: {
    items: [
      { id: "a", icon: "★", primary: "Starred", secondary: "Pinned item" },
      { id: "b", primary: "Settings", secondary: "Manage options" },
      { id: "c", icon: "✓", primary: "Done", secondary: "Completed task" },
    ],
    isOrdered: false,
    isDense: false,
    isDivided: true,
    inset: true,
  },
}

export const Selected = {
  args: {
    items: [
      { id: "a", primary: "Inbox", selected: true },
      { id: "b", primary: "Drafts" },
      { id: "c", primary: "Archive" },
    ],
  },
}

export const Disabled = {
  args: {
    items: [
      { id: "a", primary: "Active item" },
      { id: "b", primary: "Disabled item", disabled: true },
    ],
  },
}

export const Nested = {
  args: {
    items: [
      {
        id: "a",
        primary: "Parent item",
        expanded: true,
        children: [
          { id: "a-1", primary: "Child item 1" },
          { id: "a-2", primary: "Child item 2", selected: true },
        ],
      },
      { id: "b", primary: "Sibling item" },
    ],
    isDivided: true,
  },
}

export const NestedWithIcons = {
  args: {
    items: [
      {
        id: "a",
        icon: "📁",
        primary: "Projects",
        expanded: true,
        children: [
          { id: "a-1", icon: "📄", primary: "Spec.md" },
          { id: "a-2", primary: "Notes", selected: true },
        ],
      },
      { id: "b", icon: "🗂️", primary: "Archive" },
    ],
    isDivided: true,
    inset: true,
  },
}

export const WithActions = {
  args: {
    items: [
      {
        id: "a",
        primary: "Notifications",
        secondary: "Enable alerts",
        action: "On",
      },
      {
        id: "b",
        primary: "Wi-Fi",
        secondary: "Office network",
        action: "⋯",
      },
    ],
  },
}

export const Expandable = {
  args: {
    items: [
      {
        id: "a",
        primary: "Inbox",
        expanded: false,
        children: [
          { id: "a-1", primary: "Starred" },
          { id: "a-2", primary: "Drafts" },
        ],
      },
      { id: "b", primary: "Archive" },
    ],
  },
}

import { createRender } from "../../stories/notifyStory.js"
import { pagination } from "."

export default {
  title: "Navigation/Pagination",
  tags: ["autodocs"],
  render: createRender(pagination),
  argTypes: {
    page: { control: "number", description: "Current page (1-based)." },
    count: { control: "number", description: "Total number of pages." },
    siblingCount: {
      control: "number",
      description: "Pages shown beside the current page.",
    },
    isFirstButtonVisible: {
      control: "boolean",
      description: "Show first page control.",
    },
    isLastButtonVisible: {
      control: "boolean",
      description: "Show last page control.",
    },
    isDisabled: { control: "boolean", description: "Disable all controls." },
    buttonVariant: {
      control: "select",
      options: ["default", "outline", "ghost"],
      description: "Button primitive variant used for pagination controls.",
    },
    buttonColor: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "error", "info"],
      description: "Button primitive color used for non-current controls.",
    },
    buttonSize: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Button primitive size used for controls.",
    },
    onChange: { action: "onChange" },
  },
  parameters: {
    docs: {
      description: {
        component: "Paged navigation with overridable page item rendering.",
      },
    },
  },
}

export const Default = {
  args: {
    page: 4,
    count: 10,
    siblingCount: 1,
    isFirstButtonVisible: true,
    isLastButtonVisible: true,
    buttonVariant: "ghost",
    buttonColor: "secondary",
    buttonSize: "sm",
  },
}

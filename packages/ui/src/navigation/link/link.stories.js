import { createRender } from "../../stories/notifyStory.js"
import { Link } from "."

export default {
  title: "Navigation/Link",
  tags: ["autodocs"],
  render: createRender(Link),
  argTypes: {
    href: { control: "text", description: "Destination URL." },
    label: { control: "text", description: "Fallback text content." },
    underline: {
      control: "select",
      options: ["always", "hover", "none"],
      description: "Underline behavior.",
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "inherit"],
      description: "Color intent.",
    },
    isMuted: { control: "boolean", description: "Use muted text color." },
    isExternal: {
      control: "boolean",
      description: "Opens in a new tab and adds safe rel attributes.",
    },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component: "Text navigation primitive for inline links and actions.",
      },
    },
  },
}

export const Default = {
  args: {
    href: "#docs",
    label: "Read the docs",
    underline: "hover",
    color: "primary",
  },
}

export const External = {
  args: {
    href: "https://example.com",
    label: "External link",
    isExternal: true,
    underline: "always",
  },
}

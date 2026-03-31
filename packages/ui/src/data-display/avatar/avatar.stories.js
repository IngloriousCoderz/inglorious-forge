import { createRender } from "../../stories/notifyStory.js"
import { Avatar } from "."

export default {
  title: "Data Display/Avatar",
  tags: ["autodocs"],
  render: createRender(Avatar),
  argTypes: {
    src: {
      control: "text",
      description:
        "Image URL (for local Storybook public assets use /filename).",
    },
    alt: { control: "text", description: "Alternative text for avatar image." },
    initials: {
      control: "text",
      description: "Fallback initials when no image is provided.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Avatar size scale.",
    },
    shape: {
      control: "select",
      options: ["circle", "square"],
      description: "Avatar shape variant.",
    },
    color: {
      control: "select",
      options: [
        "default",
        "auto",
        "primary",
        "secondary",
        "success",
        "warning",
        "error",
        "info",
      ],
      description: "Preset color for initials or fallback content.",
    },
    backgroundColor: {
      control: "text",
      description: "Custom background color override (CSS color string).",
    },
    textColor: {
      control: "text",
      description: "Custom text color override (CSS color string).",
    },
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "User identity primitive that renders an image when `src` is set, otherwise initials or children.",
      },
    },
  },
}

export const Default = {
  args: {
    initials: "AM",
    src: "",
    size: "md",
    shape: "circle",
    color: "default",
    backgroundColor: "",
    textColor: "",
  },
}

export const WithImage = {
  args: {
    ...Default.args,
    src: "/transparent.png",
    alt: "Transparent avatar sample",
  },
}

export const ColoredInitials = {
  args: {
    ...Default.args,
    initials: "UI",
    color: "primary",
  },
}

export const AutoColor = {
  args: {
    ...Default.args,
    initials: "AD",
    color: "auto",
  },
}

export const CustomColor = {
  args: {
    ...Default.args,
    initials: "IC",
    backgroundColor: "#1d4ed8",
    textColor: "#ffffff",
  },
}

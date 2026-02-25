import { makeStoryRender } from "../../stories/notifyStory.js"
import { avatar } from "."

export default {
  title: "Data Display/Avatar",
  tags: ["autodocs"],
  render: makeStoryRender(avatar, "story-avatar"),
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
  },
}

export const WithImage = {
  args: {
    src: "/transparent.png",
    alt: "Transparent avatar sample",
    initials: "AM",
    size: "md",
    shape: "circle",
  },
}

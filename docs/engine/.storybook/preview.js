/** @typedef { import('@storybook/react-vite').Preview } Preview */

import "./style.css"

import theme from "./theme"

/** @type {Preview} */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    a11y: {
      test: "todo",
    },

    docs: { theme },
    layout: "centered",
  },

  options: {
    storySort: {
      order: ["Docs", "Core Concepts"],
    },
  },

  argTypes: { renderer: { control: "radio", options: ["canvas", "react"] } },

  args: { renderer: "canvas" },
}

preview.parameters.initialStory = "docs-quick-start--docs"

export default preview

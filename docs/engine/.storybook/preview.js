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
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
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

// Set default story to quick-start
preview.parameters.initialStory = "docs-quick-start--docs"

export default preview

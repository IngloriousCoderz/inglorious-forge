import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { defineMain } from "@storybook/web-components-vite/node"

export default defineMain({
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {
      // ...
    },
  },
})

function getAbsolutePath(value) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

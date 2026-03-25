import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { jsx } from "@inglorious/vite-plugin-jsx"
import { vue } from "@inglorious/vite-plugin-vue"
import { defineMain } from "@storybook/web-components-vite/node"
import { mergeConfig } from "vite"

export default defineMain({
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {
      // ...
    },
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [jsx(), vue()],

      resolve: {
        alias: {
          "@": fileURLToPath(new URL("../src", import.meta.url)),
        },
      },
    })
  },
})

function getAbsolutePath(value) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

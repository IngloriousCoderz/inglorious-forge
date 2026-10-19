import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { jsx } from "@inglorious/vite-plugin-jsx"
import { vue } from "@inglorious/vite-plugin-vue"
import { defineMain } from "@storybook/web-components-vite/node"
import remarkGfm from "remark-gfm"
import { mergeConfig } from "vite"

export default defineMain({
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      // GitHub Flavored Markdown, for the tables in MDX docs.
      options: {
        mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } },
      },
    },
  ],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {
      // ...
    },
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [jsx(), vue()],

      // Skip esbuild's automatic dependency pre-scan of story entries. The
      // scanner does not apply Vite plugins, so it reads `.vue` SFCs before
      // `@inglorious/vite-plugin-vue` compiles them and fails with
      // "No matching export ... for import DashboardVue". Deps are still
      // discovered lazily through the normal (plugin-aware) transform pipeline.
      optimizeDeps: {
        entries: [],
      },

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
